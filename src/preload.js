const axios = require('axios');

// 去除html标签
function removeHtmlTag(str) {
   return str.replace(/<[^>]+>/g, '');
}

function handleOutput(searchWord, callbackSetList = () => {}) {
   const encodeInput = encodeURIComponent(searchWord);
   callbackSetList([{
      title: '正在查询中，请稍后',
   }])
   axios({
      url: `http://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=${encodeInput}`,
      method: 'get',
   }).then(res => {
      const { id, name, card, image, abstract, url, wapUrl } = res.data
      if (id) {
         const list = card.map(val => ({
            title: removeHtmlTag(val.value.join(',')),
            description: val.name,
            icon: image,
            url,
         }))
         wapUrl && list.unshift({
            title: '秒懂百科',
            description: '点击或回车查看视频',
            icon: image,
            url: wapUrl,
         })
         list.unshift({
            title: abstract,
            description: searchWord,
            icon: image,
            url,
         })
         callbackSetList(list)
      } else {
         callbackSetList([{
            title: '没有找到相关结果',
            description: '回车前往百度搜索',
            arg: `https://www.baidu.com/s?wd=${encodeInput}`,
         }])
      }
   }).catch(err => {
      callbackSetList([{
         title: '没有找到相关结果',
         description: '回车前往百度搜索',
         arg: `https://www.baidu.com/s?wd=${encodeInput}`,
      }])
   })
}

window.exports = {
   "utools-bk": {
      mode: "list",
      args: {
         enter: (action, callbackSetList) => {
            // 无操作
         },
         search: async (action, searchWord, callbackSetList) => {
            handleOutput(searchWord, callbackSetList);
         },
         // 用户选择列表中某个条目时被调用
         select: (action, itemData) => {
            window.utools.hideMainWindow()
            require('electron').shell.openExternal(itemData.url)
            // 保证网页正常跳转再关闭插件
            setTimeout(() => {
               window.utools.outPlugin()
            }, 500);
         },
         placeholder: '请输入食物名称',
      },
   },
   "utools-bk-super": {
      mode: "list",
      args: {
         enter: (action, callbackSetList) => {
            // 设置初始值
            setTimeout(() => {
               utools.setSubInputValue(action.payload);
            });
            handleOutput(action.payload, callbackSetList);
         },
         search: async (action, searchWord, callbackSetList) => {
            handleOutput(searchWord, callbackSetList);
         },
         // 用户选择列表中某个条目时被调用
         select: (action, itemData) => {
            window.utools.hideMainWindow()
            require('electron').shell.openExternal(itemData.url)
            // 保证网页正常跳转再关闭插件
            setTimeout(() => {
               window.utools.outPlugin()
            }, 500);
         },
         placeholder: '请输入食物名称',
      },
   }
}