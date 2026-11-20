(function () {
  var status = document.getElementById("offline-status"),
    list = document.getElementById("cached-pages");
  if (!navigator.serviceWorker) {
    status.textContent = "Offline page lists are not available in this browser.";
    return;
  }
  navigator.serviceWorker.ready.then(function (registration) {
    var worker = navigator.serviceWorker.controller || registration.active;
    if (!worker) throw new Error("service worker is not active");
    var channel = new MessageChannel();
    channel.port1.onmessage = function (event) {
      var pages = event.data && event.data.pages || [];
      list.textContent = "";
      pages.forEach(function (href) {
        var url = new URL(href),
          name = decodeURIComponent(url.pathname.split("/").pop() || "Home").replace(/\.html$/, "").replace(/[-_]+/g, " "),
          item = document.createElement("li"),
          link = document.createElement("a");
        if (name === "index") name = "Course hub";
        if (name === "how to use") name = "How to use";
        if (name === "version log") name = "Version log";
        link.href = url.pathname + url.search;
        link.textContent = name.replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
        item.appendChild(link);
        list.appendChild(item);
      });
      status.textContent = pages.length + (pages.length === 1 ? " page is" : " pages are") + " available offline.";
    };
    worker.postMessage({ type: "offline-pages" }, [channel.port2]);
  }).catch(function () {
    status.textContent = "Saved pages will appear after the site has been online once.";
  });
})();
