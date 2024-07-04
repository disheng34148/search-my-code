<script setup>
import { onMounted, ref } from "vue";
import { ElTreeV2, ElTree } from "element-plus";
import changeTheme from "./utils/theme";
import { debounce, formatSearchResult } from "./utils/util";

const vscode = acquireVsCodeApi();
const treeData = ref([]);
let cacheTreeData = [];
const theme = ref();
const keyword = ref();
const match = ref("gi");
const loading = ref(true);

const openFile = (data) => {
  console.log(data);
  if (!data.hash) {
    vscode.postMessage(
      JSON.stringify({
        command: "openFile",
        data,
      })
    );
  }
};

// 是否大小写
const clickBtn = (e) => {
  const target = e.target.parentElement;

  if (target.classList.contains("selected")) {
    match.value = "gi";
    target.classList.remove("selected");
  } else {
    match.value = "g";
    target.classList.add("selected");
  }

  vscode.postMessage(
    JSON.stringify({
      command: "search",
      data: {
        keyword: keyword.value,
        files: cacheTreeData,
        match: match.value,
      },
    })
  );
};

onMounted(() => {
  window.addEventListener("message", (event) => {
    const { command, data } = event.data;

    switch (command) {
      case "getFiles":
        treeData.value = data;
        cacheTreeData = data;
        loading.value = false;
        break;
      case "theme":
        theme.value = data.isDark ? "dark" : "light";
        changeTheme(theme.value);
        break;
      case "searchResult":
        treeData.value = formatSearchResult(data);
        console.log(treeData.value, '@@@@@@@@')
        loading.value = false;
        break;

      default:
        break;
    }
  });

  const field = document.getElementById("search-input");
  const search = (value) => {
    if (!value) {
      treeData.value = cacheTreeData;
    } else {
      vscode.postMessage(
        JSON.stringify({
          command: "search",
          data: {
            keyword: value,
            files: cacheTreeData,
            match: match.value,
          },
        })
      );
    }
    keyword.value = value;
  };
  const debouncedSearch = debounce(search, 300);

  field.addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
  });
  field.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      debouncedSearch(e.target.value);
    }
  });
});
</script>

<template>
  <div>
    <vscode-text-field
      placeholder="Search..."
      class="search-input"
      id="search-input"
    >
      <section
        slot="end"
        style="
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        "
      >
        <vscode-button
          appearance="icon"
          aria-label="Match Case"
          class="search-btn"
          id="search-btn"
          @click="clickBtn"
        >
          <span class="codicon codicon-case-sensitive"></span>
        </vscode-button>
      </section>
    </vscode-text-field>
  </div>

  <div class="search-tree-wrapper">
    <el-tree
      class="search-tree"
      v-loading="loading"
      :data="treeData"
      :props="{
        label: 'message',
        path: 'path',
        children: 'files'
      }"
      default-expand-all
      @node-click="openFile"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <span class="custom-tree-node-title" v-if="data.type === 'search'">
            <span class="title-item">{{ data.frontLabel }}</span>
            <span class="title-main">{{ node.label }}</span>
            <span class="title-item">{{ data.endLabel }}</span>
          </span>
          <span v-else class="custom-tree-node-title">{{ node.label }}</span>
          <span class="custom-tree-node-desc" v-if="data.path">{{
            data.path
          }}</span>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<style scoped>
.search-tree-wrapper {
  flex: 1;
  overflow-y: auto;
}
.search-tree {
  background: transparent;
  color: rgba(var(----color), 0.75);
}
.search-tree :deep(.el-tree-node__content):hover {
  background: transparent;
}
.search-tree :deep(.el-tree-node:focus > .el-tree-node__content) {
  background: var(--focusColor);
}
.search-input {
  width: 100%;
  background: transparent;
}
.custom-tree-node {
  display: flex;
  align-items: center;
}
.custom-tree-node-title {
  line-height: 1;
}
.custom-tree-node-desc {
  font-size: 12px;
  opacity: 0.65;
  margin-left: 15px;
  line-height: 1;
  display: flex;
  align-items: center;
}
.custom-tree-node-title .title-main {
  background: rgba(97, 153, 255, 0.18);
}
.search-input::part(root) {
  background: transparent;
}
.search-btn:hover {
  outline: none;
  background: transparent;
}
.search-btn.selected {
  border: 1px solid #007acc;
}
</style>
