(function(){
  var t;
  try{ t = localStorage.getItem('tokyo-theme'); }catch(e){}
  document.documentElement.dataset.theme = (t === 'light') ? 'light' : 'dark';
})();

(function(){
  var btn = document.getElementById('themeBtn');
  function paint(){
    var light = document.documentElement.dataset.theme === 'light';
    btn.textContent = light ? '🌙 深色' : '☀️ 淺色';
  }
  btn.addEventListener('click', function(){
    var next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try{ localStorage.setItem('tokyo-theme', next); }catch(e){}
    paint();
  });
  paint();
})();
