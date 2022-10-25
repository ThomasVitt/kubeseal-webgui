<template>
  <div class="secrets-component">
    <h3 v-if="displayName">
      {{ displayName }}
    </h3>
    <div
      v-if="displayCreateSealedSecretForm"
      class="secrets-form"
    >
      <el-form>
        <el-row
          justify="center"
          :gutter="20"
        >
          <el-col :span="4">
            <el-select
              v-model="namespaceName"
              class="m-2"
              placeholder="Namespace"
              filterable
            >
              <el-option
                v-for="item in namespaces"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <div class="helper">
              Select the target namespace where the sealed secret will be
              deployed.
            </div>
          </el-col>
          <el-col :span="5">
            <el-input
              id="input-secret-name"
              v-model="secretName"
              placeholder="Secret name"
              :rules="[rules.validDnsSubdomain]"
              :state="secretNameState"
            />
            <div class="helper">
              Specify name of the secret.
              <br>
              <i>The secret name must be of type:
                <a
                  target="_blank"
                  href="https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-subdomain-names"
                >DNS
                  Subdomain</a></i>
            </div>
          </el-col>
          <el-col :span="3">
            <el-select
              v-model="scope"
              placeholder="Scope"
            >
              <el-option
                v-for="item in scopes"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <div class="helper">
              Specify scope of the secret.
              <br>
              <i>
                <a
                  target="_blank"
                  href="https://github.com/bitnami-labs/sealed-secrets#scopes"
                >Scopes for sealed
                  secrets</a></i>
            </div>
          </el-col>
        </el-row>

        <el-row
          v-for="(secret, counter) in secretsState"
          :key="counter"
          :gutter="20"
          justify="center"
        >
          <el-col :span="3">
            <el-input
              v-model="secret.key"
              :rows="1"
              placeholder="Secret key"
              :rules="[rules.validDnsSubdomain]"
            />
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="secret.value"
              type="textarea"
              placeholder="Secret value"
              autosize
            />
          </el-col>
          <el-col :span="1">
            <el-button
              circle
              link
              @click="removeSecret"
            >
              <Delete />
            </el-button>
          </el-col>
        </el-row>
        <el-row
          justify="center"
          :gutter="20"
        >
          <el-col :span="10">
            <el-alert
              v-model="hasErrorMessage"
              closable
              type="warning"
              show-icon
            >
              <b>
                Error while encoding sensitive data. Please contact your
                administrator and try again later.
                <b>Error message: </b>
                <p class="mt-3">
                  <code>{{ errorMessage }}</code>
                </p>
              </b>
            </el-alert>
          </el-col>
        </el-row>
        <el-row
          justify="center"
          :gutter="20"
        >
          <el-col :span="2">
            <el-button
              round
              type="info"
              @click="secrets.push({ key: '', value: '' })"
            >
              Add key-value pair
            </el-button>
          </el-col>
          <el-col :span="2">
            <el-button
              round
              type="primary"
              @click="fetchEncodedSecrets()"
            >
              Encrypt
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div v-else>
      <el-row
        justify="center"
        :gutter="20"
      >
        <el-col :span="12">
          <el-scrollbar>
            <div class="scrollbar-flex-content">
              <pre ref="sealedSecret">apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: {{ secretName }}
  namespace: {{ namespaceName }}
spec:
  encryptedData: 
{{ renderedSecrets }}
              </pre>
            </div>
          </el-scrollbar>
        </el-col>
      </el-row>
      <el-row
        justify="center"
        :gutter="20"
      >
        <el-col :span="6">
          <el-button
            v-if="clipboardAvailable"
            type="success"
            @click="copyRenderedSecrets()"
          >
            <ContentCopy size="25px" />
            Copy complete secret
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button
            type="info"
            @click="displayCreateSealedSecretForm = !displayCreateSealedSecretForm"
          >
            Encrypt more secrets
          </el-button>
        </el-col>
      </el-row>
      <el-row
        v-if="clipboardAvailable"
        :gutter="20"
      >
        <el-col
          v-for="(secret, counter) in sealedSecrets"
          :key="counter"
          class="flex"
        >
          <el-button
            link
            @click="copySealedSecret(counter)"
          >
            <ContentCopy size="25px" />
            Copy key: <code>{{ secret["key"] }}</code>
          </el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { Base64 } from "js-base64";
import Delete from 'vue-material-design-icons/Delete.vue';
import ContentCopy from 'vue-material-design-icons/ContentCopy.vue';

function validDnsSubdomain(name) {
  if (!name) {
    return;
  }
  var re = /^[a-z0-9]([a-z0-9._-]{0,251}[a-z0-9])?$/;
  return re.test(name);
}

export default {
  name: "SealedSecrets",
  components: {
    Delete,
    ContentCopy,
  },
  data: function () {
    return {
      namespaces: [],
      scopes: ["strict", "cluster-wide", "namespace-wide"],
      errorMessage: "",
      displayName: "",
      displayCreateSealedSecretForm: true,
      secretName: "",
      namespaceName: "",
      scope: "strict",
      secrets: [{ key: "", value: "" }],
      sealedSecrets: [],
      clipboardAvailable: false,
      rules: { validDnsSubdomain: value => validDnsSubdomain(value) || "Not a valid DNS subdomain" },
    };
  },
  computed: {
    hasErrorMessage: function () {
      return !(!this.errorMessage || 0 === this.errorMessage.length)
    },
    secretNameState: function () {
      return validDnsSubdomain(this.secretName);
    },
    namespaceNameState: function () {
      return validDnsSubdomain(this.namespaceName);
    },
    secretsState: function () {
      return this.secrets.map((e) => {
        e.state = validDnsSubdomain(e.key);
        return e;
      });
    },
    hasNoSecrets: function () {
      if (this.secrets.length > 1) {
        return false;
      }
      let secret = this.secrets[0];
      return secret.key === '' && secret.value === '';
    },
    renderedSecrets: function () {
      return this.renderSecrets(this.sealedSecrets);
    },
  },
  beforeMount() {
    this.fetchNamespaces();
    this.fetchDisplayName();
  },
  mounted: function () {
    if (navigator && navigator.clipboard) {
      this.clipboardAvailable = true;
    }
  },
  methods: {
    fetchNamespaces: async function () {
      try {
        let response = await fetch("/config.json");
        let data = await response.json();
        let apiUrl = data["api_url"];

        response = await fetch(`${apiUrl}/namespaces`);
        this.namespaces = await response.json();
      } catch (error) {
        this.errorMessage = error;
      }
    },
    fetchDisplayName: async function () {
      let response = await fetch("/config.json");
      let data = await response.json();
      let dName = data["display_name"];
      this.displayName = dName;
    },
    fetchEncodedSecrets: async function () {
      try {
        var requestObject = {
          secret: this.secretName,
          namespace: this.namespaceName,
          scope: this.scope,
          secrets: this.secrets.map((element) => {
            return {
              key: element.key,
              value: Base64.encode(element.value),
            };
          }),
        };

        let requestBody = JSON.stringify(requestObject, null, "\t");

        let response = await fetch("/config.json");
        let data = await response.json();
        let apiUrl = data["api_url"];

        response = await fetch(`${apiUrl}/secrets`, {
          method: "POST",
          headers: {
            // 'Origin': 'http://localhost:8080',
            "Content-Type": "application/json",
          },
          body: requestBody,
        });

        if (!response.ok) {
          throw Error(
            "No sealed secrets in response from backend: " +
            (await response.text())
          );
        } else {
          this.sealedSecrets = await response.json();
          this.displayCreateSealedSecretForm = false;
        }
      } catch (error) {
        this.errorMessage = error;
      }
    },
    renderSecrets: function (sealedSecrets) {
      var dataEntries = sealedSecrets.map((element) => {
        return `    ${element["key"]}: ${element["value"]}`;
      });
      return dataEntries.join("\n");
    },
    copyRenderedSecrets: function () {
      let sealedSecretElement = this.$refs.sealedSecret;
      console.log("sealedSecretElement: ", sealedSecretElement)
      let sealedSecretContent = sealedSecretElement.innerText.trim()
      navigator.clipboard.writeText(sealedSecretContent);
    },
    copySealedSecret: function (counter) {
      navigator.clipboard.writeText(this.sealedSecrets[counter].value)
    },
    removeSecret: function (counter) {
      if (this.secrets.length > 1) {
        this.secrets.splice(counter, 1)
      } else {
        this.secrets[0].key = '';
        this.secrets[0].value = '';
      }
    }
  },
};
</script>
<style scoped>
.helper {
  font-size: 12px;
  margin-top: 0.8em;
  margin-left: 0.8em;
  margin-bottom: 1em;
  text-align: left;
}

.el-row {
  margin-bottom: 10px;
}

pre {
  font-family: Consolas, "courier new";
  padding: 2px;
  font-size: 105%;
  text-align: left;
}
</style>
