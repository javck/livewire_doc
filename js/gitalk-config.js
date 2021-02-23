var gitalk = new Gitalk({
    "clientID": "04dd6ef9c9dcc45f66e7",
    "clientSecret": "75d0609523abb408caf1c0a7ed8cef158bba5eb9",
    "repo": "livewire_doc",
    "owner": "javck",
    "admin": ["javck"],
    "id": location.pathname,      
    "distractionFreeMode": false  
});
gitalk.render("gitalk-container");