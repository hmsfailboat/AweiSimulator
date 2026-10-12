/* 啟動 */
(function (root) {
  'use strict';
  const start = () => root.AW.UI.init();
  if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start);
  else start();
})(window);
