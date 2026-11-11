(function(){
  function add(){
    if(document.getElementById("miiengine-sandbox-link"))return;
    var link=document.createElement("a");link.id="miiengine-sandbox-link";link.href="/sandbox.html";link.textContent="3D Sandbox";link.setAttribute("aria-label","Open the MiiEngine 3D sandbox");
    link.style.cssText="position:fixed;z-index:99999;right:18px;bottom:18px;padding:11px 16px;border-radius:999px;background:linear-gradient(120deg,#a99cff,#8275ed);color:#17142d;font:700 13px system-ui;text-decoration:none;box-shadow:0 8px 30px #0004";
    document.body.appendChild(link);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",add,{once:true});else add();
})();