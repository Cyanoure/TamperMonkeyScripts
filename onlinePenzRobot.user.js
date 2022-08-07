// ==UserScript==
// @name         onlinePenzRobot
// @namespace    https://kozelkaricsi.hu/
// @version      0.1
// @description  try to take over the world!
// @author       Cyanoure
// @match        *://www.onlinepenztarca.hu/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=onlinepenztarca.hu
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var currentPath = document.location.pathname;
    var currentPage = parseInt(document.location.search.substr(6));
    var requestCounter = 0;
    function jumpPage(n = 0){
        var url = document.location.origin+document.location.pathname+"?page="+n;
        document.location.replace(url);
    }
    function jumpNextPage(){
        jumpPage(currentPage+1);
    }

    function readBlog(blogURL){
        var url = blogURL.replace("story","story/read");
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function(){
            console.log(this.responseText);
            requestCounter--;
        }
        xhttp.open("GET", url, true);
        requestCounter++;
        xhttp.send();
    }

    function getBlogLinks(){
        var links = [];
        var linkElements = document.getElementsByTagName("a");
        for(var i = 0; i < linkElements.length; i++){
            var linkElement = linkElements[i];
            if(linkElement.href.startsWith(document.location.origin+"/story/")){
                var url = linkElement.href;
                if(links.indexOf(url) == -1){
                    links.push(url);
                }
            }
        }
        return links;
    }

    if(currentPath.startsWith("/story/")){
        console.log("-- Olvasás --");
    }else if(currentPath == "/story"){
        console.log("-- Blog választó --");
        var links = getBlogLinks();
        for(var i = 0; i < links.length; i++){
            var link = links[i];
            readBlog(link);
        }
    }
    setInterval(()=>{
        if(requestCounter == 0){
            jumpNextPage();
        }
    },3000);
})();
