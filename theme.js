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

if('serviceWorker' in navigator){ try{ navigator.serviceWorker.register('sw.js'); }catch(e){} }


// ---- weather ticker (all pages) ----
(function(){
  var bar=document.createElement('div');
  bar.className='wxticker'; bar.setAttribute('role','status'); bar.setAttribute('aria-label','東京即時天氣');
  document.body.insertBefore(bar, document.body.firstChild);
  function setText(t){ bar.innerHTML='<div class="wx-track"><span>'+t+'</span><span>'+t+'</span></div>'; }
  setText('🏮 東京夏物語 7/30–8/4　・　載入東京即時天氣中…');
  function icon(c){ if(c===0){return'☀️';} if(c<=2){return'🌤';} if(c===3){return'☁️';} if(c<=48){return'🌫';} if(c<=57){return'🌦';} if(c<=67){return'🌧';} if(c<=77){return'🌨';} if(c<=82){return'🌧';} return'⛈';}
  function render(d, stale){
    var c=d.current, dy=d.daily;
    setText(icon(c.weather_code)+' <b>東京現在 '+Math.round(c.temperature_2m)+'°C</b>'
      +'　・　體感 '+Math.round(c.apparent_temperature)+'°'
      +'　・　今日 '+Math.round(dy.temperature_2m_min[0])+'–'+Math.round(dy.temperature_2m_max[0])+'°'
      +'　・　降雨機率 '+dy.precipitation_probability_max[0]+'%'
      +(stale?'　・　（離線資料）':'')
      +'　・　🏮 東京夏物語 7/30–8/4 三人旅');
  }
  var cached=null;
  try{ cached=JSON.parse(localStorage.getItem('tokyo-wx')||'null'); }catch(e){}
  fetch('https://api.open-meteo.com/v1/forecast?latitude=35.72&longitude=139.79&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=1')
    .then(function(r){ return r.json(); })
    .then(function(d){ render(d,false); try{ localStorage.setItem('tokyo-wx', JSON.stringify(d)); }catch(e){} })
    .catch(function(){ if(cached){ render(cached,true); } });
})();
