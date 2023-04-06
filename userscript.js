// ==UserScript==
// @name         Lolzteam Multiaccount Finder
// @version      1.4.0
// @description  Your assistant in finding scammers on the forum
// @author       vuchaev2015
// @match        https://zelenka.guru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zelenka.guru
// @grant        none
// @namespace http://tampermonkey.net/
// ==/UserScript==

let domain = 'zelenka.guru'
let items = [
    {key: "autocheck-mini-profile", value: "false"},
    {key: "autocheck-profile", value: "false"},
    {key: "autocheck-banned-users-mporp", value: "false"},
    {key: "addbutton-profile", value: "true"},
    {key: "addbutton-threads", value: "true"},
    {key: "autocheck-online-registered", value: "false"},
    {key: "show-blocked-percentage", value: "true"},
    {key: "show-unblocked-percentage", value: "true"},
    {key: "show-total-users-ip", value: "true"},
    {key: "show-blocked-this-month-percentage", value: "true"},
    {key: "autocheck-newmembers", value: "false"},
    {key: "autocheck-only-parameters", value: "false"},
    {key: "autocheck-only-parameters-sympathies", value: "20"},
    {key: "autocheck-only-parameters-messages", value: "50"},
    {key: "addbutton-chat", value: "true"},
    {key: "addbutton-alerts", value: "true"},
    {key: "addbutton-conversations", value: "true"}
];

items.forEach(function(item) {
    if (!localStorage.getItem(item.key)) {
        localStorage.setItem(item.key, item.value);
    }
});

let accountMenu = document.getElementById("AccountMenu");
let linksList = accountMenu.querySelector(".blockLinksList");
let buttonId = `lmfsettings`;

linksList.insertAdjacentHTML('beforeend', `<li><a href="javascript:void(0)" id="${buttonId}">Multiaccount Finder</a></li>`);

document.getElementById(buttonId).addEventListener("click", function (event) {
    event.preventDefault();
    openSettings();
});

let hrefSearchUsers = document.querySelector('a[href^="/search/search?users="]').href.split('?users=')[1].split('&')[0];
let profileLink = document.querySelector("#AccountMenu > ul > li:nth-child(1) > a").getAttribute("href").split(`${domain}`)[1];

const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const date = new Date();
date.getDate();
const month = months[date.getMonth()];
date.getFullYear();

// ***вроде оптимизирован более-менее***
// Меню с настройками
function openSettings() {
    const unixtime = Math.floor(Date.now() / 1000);
    let checkboxes = [
        {
            id: "autocheck-profile", label: "Автоматическая проверка в профиле"
        },
        {
            id: "autocheck-mini-profile", label: "Автоматическая проверка в мини-профиле"
        },
        {
            id: "autocheck-banned-users-mporp", label: "Автоматическая проверка для заблокированных", dependent: ["autocheck-profile", "autocheck-mini-profile"]
        },
        {
            id: "autocheck-newmembers", label: "Автоматическая проверка новых пользователей в разделе /members"
        },
        {
            id: "autocheck-online-registered", label: "Автоматическая проверка в разделе /online/?type=registered"
        },
        {
            id: "autocheck-only-parameters", label: "Автоматическая проверка только по параметрам (<<span id='sympCount-" + unixtime + "'>" + localStorage.getItem("autocheck-only-parameters-sympathies") + "</span> симпатий и <" + "<span id='msgCount-" + unixtime + "'>" + localStorage.getItem("autocheck-only-parameters-messages") + "</span> сообщений)"
        },
        {
            id: "addbutton-threads", label: "Добавить кнопку на посты и комментарии в теме (три точки)"
        },
        {
            id: "addbutton-chat", label: "Добавить кнопку на сообщения в чате (три точки)"
        },
        {
            id: "addbutton-profile", label: "Добавить кнопку на посты и комментарии в профиле (три точки)"
        },
        {
            id: "addbutton-alerts", label: "Добавить кнопку на уведомления в списке /account/alerts (три точки)"
        },
        {
            id: "addbutton-conversations", label: "Добавить кнопку на диалоги в личных сообщениях (три точки)"
        },
        {
            id: "show-blocked-percentage", label: "Добавить в подробную информацию % заблокированных"
        },
        {
            id: "show-unblocked-percentage", label: "Добавить в подробную информацию % не заблокированных"
        },
        {
            id: "show-total-users-ip", label: "Добавить в подробную информацию общее количество пользователей в общих IP"
        },
        {
            id: "show-blocked-this-month-percentage", label: "Добавить в подробную информацию % от заблокированных в этом месяце"
        }
    ];
    let content = "";
    const numCheckboxes = checkboxes.length;
    checkboxes.forEach(function(checkbox, index) {
        let isChecked = localStorage.getItem(checkbox.id) === "true";
        const disabled = checkbox.dependent && !checkbox.dependent.every(function (dep) {
            return localStorage.getItem(dep) === "true";
        });
        content += '<div> <input type="checkbox" id="' + checkbox.id + '-' + unixtime + '" name="' + checkbox.id + '-' + unixtime + '" ' + (isChecked ? 'checked="checked" ' : '') + (disabled ? 'disabled ' : '') + 'value="1"> ' + checkbox.label + '</div>';
        if (index !== numCheckboxes - 1) {
            content += '<br>';
        }
    });

    XenForo.alert(content, 'Lolzteam Multiaccount Finder');

    checkboxes.forEach(function(checkbox) {
        const id = checkbox.id + '-' + unixtime;
        const checkboxEl = document.getElementById(id);
        checkboxEl.addEventListener('change', function() {
            localStorage.setItem(checkbox.id, `${this.checked}`);
        });
    });
    document.querySelector("#sympCount-" + unixtime).addEventListener("click", function() {
        const newSympCount = prompt("Введите новое значение счетчика симпатий:");
        if (newSympCount !== null && !isNaN(parseInt(newSympCount)) && newSympCount.trim() !== '') {
            localStorage.setItem("autocheck-only-parameters-sympathies", newSympCount);
            document.getElementById("sympCount-" + unixtime).textContent = newSympCount;
        }
    });
    document.getElementById("msgCount-" + unixtime).addEventListener("click", function() {
        const newMsgCount = prompt("Введите новое значение счетчика сообщений:");
        if (newMsgCount !== null && !isNaN(parseInt(newMsgCount)) && newMsgCount.trim() !== '') {
            localStorage.setItem("autocheck-only-parameters-messages", newMsgCount);
            document.getElementById("msgCount-" + unixtime).textContent = newMsgCount;
        }
    });
}

// ***уже оптимизирован***
// Добавляем кнопку Multiaccount Finder в профиле и мини профиле если присутствует кнопка shared-ips
function checkMenuItems() {
    const sharedItems = document.querySelectorAll('.Menu a[href*="/shared-ips"]');
    sharedItems.forEach(item => {
        const menu = item.parentNode.parentNode;
        if (menu.hasAttribute("data-multiaccount-finder")) return;
        menu.setAttribute("data-multiaccount-finder", "added");
        const newMenuItem = document.createElement("li");
        const buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
        newMenuItem.innerHTML = `<a href="javascript:void(0)" id="${buttonId}">Multiaccount Finder</a>`;
        menu.appendChild(newMenuItem);
        const currentUrl = item.getAttribute('href');
        const multiaccountFinderButton = document.getElementById(buttonId);
        if (multiaccountFinderButton) {
            multiaccountFinderButton.addEventListener("click", event => {
                event.preventDefault();
                checkUser(currentUrl).then();
            })
        }
        const makeClaimLink = menu.querySelector('a[href*="/make-claim"]');
        if (makeClaimLink) {
            if (localStorage.getItem("autocheck-mini-profile") !== 'true') return;
            //console.log(makeClaimLink.parentNode.parentNode)
            const bannedModule = document.querySelectorAll('.usernameAndStatus');
            bannedModule.forEach(module => {
                const bannedcheck = module.parentNode.parentNode;
                if (bannedcheck.hasAttribute("data-multiaccount-finder")) return;
                bannedcheck.setAttribute("data-multiaccount-finder", "added");
                const gifElement = document.createElement('img');
                const gifId = `gif-profile-${generateRandomString(10)}`;
                gifElement.id = gifId;
                gifElement.src = 'https://cdn.lowgif.com/full/631c400b903c03d9-loading-gif-wpfaster.gif';
                gifElement.width = '24';
                gifElement.height = '24';
                gifElement.title = '';
                const countsModule = document.querySelectorAll('.userStatCounters');
                let lastElement = countsModule[countsModule.length - 1]
                const miniprofileMenu = lastElement.parentNode.parentNode;
                if (miniprofileMenu.hasAttribute("data-multiaccount-finder")) return;
                miniprofileMenu.setAttribute("data-multiaccount-finder", "added");
                //console.log(lastElement)
                let sympathies = lastElement.querySelector('a:nth-child(1) > span.count').textContent.replace(/ /g, "")
                let messages = lastElement.querySelector('a:nth-child(2) > span.count').textContent.replace(/ /g, "");
                if (sympathies || messages) {
                    if (localStorage.getItem("autocheck-only-parameters") === 'true' && (sympathies >= parseInt(localStorage.getItem("autocheck-only-parameters-sympathies")) && messages >= parseInt(localStorage.getItem("autocheck-only-parameters-messages")))) return;
                }

                lastElement.appendChild(gifElement);
                if (localStorage.getItem("autocheck-banned-users-mporp") === 'false' && bannedcheck.querySelector('.banInfo.muted.Tooltip') || bannedcheck.querySelector('div.errorPanel')) {
                    const element = document.getElementById(gifId);
                    if (element) element.remove();
                    return;
                }
                const element = document.getElementById(buttonId);
                if (element) element.remove();
                checkUser(currentUrl, undefined, gifId).then();
                //console.log(currentUrl)
            });
        } else {
            if (localStorage.getItem("autocheck-profile") !== 'true') return;

            let sympathies = document.querySelector("#content > div > div > div.profilePage > div.mainProfileColumn > div > div.counts_module > a.page_counter.Tooltip > div.count").textContent.replace(/ /g, "")
            let messages = document.querySelector("#content > div > div > div.profilePage > div.mainProfileColumn > div > div.counts_module > a:nth-child(2) > div.count").textContent.replace(/ /g, "")
            if (localStorage.getItem("autocheck-only-parameters") === 'true' && document.querySelector("#content > div > div > div.profilePage > div.mainProfileColumn > div > div.counts_module > a.page_counter.Tooltip > div.count") && document.querySelector("#content > div > div > div.profilePage > div.mainProfileColumn > div > div.counts_module > a:nth-child(2) > div.count") && (sympathies >= parseInt(localStorage.getItem("autocheck-only-parameters-sympathies")) && messages >= parseInt(localStorage.getItem("autocheck-only-parameters-messages")))) return;
            const bannedModule = document.querySelectorAll('div.mainProfileColumn');
            bannedModule.forEach(module => {
                const bannedcheck = module.parentNode.parentNode;
                if (bannedcheck.hasAttribute("data-multiaccount-finder")) return;
                bannedcheck.setAttribute("data-multiaccount-finder", "added");
                const gifElement = document.createElement('img');
                const gifId = `gif-profile`;
                gifElement.id = gifId;
                gifElement.src = 'https://cdn.lowgif.com/full/631c400b903c03d9-loading-gif-wpfaster.gif';
                gifElement.width = '32';
                gifElement.height = '32';
                gifElement.title = '';
                const countsModule = document.querySelectorAll('.counts_module');
                countsModule.forEach(module => {
                    const profilecounter = module.parentNode.parentNode;
                    if (profilecounter.hasAttribute("data-multiaccount-finder")) return;
                    profilecounter.setAttribute("data-multiaccount-finder", "added");
                    if (sympathies || !messages) {
                        if (localStorage.getItem("autocheck-only-parameters") === 'true' && (sympathies >= parseInt(localStorage.getItem("autocheck-only-parameters-sympathies")) && messages >= parseInt(localStorage.getItem("autocheck-only-parameters-messages")))) return;
                    }
                    module.appendChild(gifElement);
                    if (localStorage.getItem("autocheck-banned-users-mporp") === 'false' && bannedcheck.querySelector('div.errorPanel')) {
                        const element = document.getElementById(gifId);
                        if (element) element.remove();
                        return;
                    }
                    const element = document.getElementById(buttonId);
                    if (element) element.remove();
                    checkUser(currentUrl, undefined, gifId).then();
                });
            });
        }
    });
}

function generateRandomString(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// ***уже оптимизирован***
function checkThreadItems() {
    if (localStorage.getItem("addbutton-threads") === 'true') {
        const linksLists = [...document.querySelectorAll('.secondaryContent.blockLinksList')]
        .filter(list => !list.querySelector('li[id^="multiaccountFinderButton-"]'));

        linksLists.forEach((linksList) => {
            const links = linksList.querySelectorAll("a");

            links.forEach((link) => {
                if (link.href.startsWith(`https://${domain}/posts/`)) {
                    let postId;
                    let newLink;
                    let postElement;

                    if (link.href.includes('posts/comments/')) {
                        postId = link.href.split('posts/comments/')[1].split('/')[0];
                        newLink = `post-comment-${postId}`
                    } else {
                        postId = link.href.split('posts/')[1].split('/')[0];
                        newLink = `post-${postId}`
                    }

                    postElement = document.querySelector(`#${newLink}.${link.href.includes('posts/comments/') ? 'comment' : 'message'}`);

                    if (postElement && !postElement.hasAttribute("data-multiaccount-finder")) {
                        postElement.setAttribute("data-multiaccount-finder", "added");

                        const menus = [...document.querySelectorAll('div.Menu')]
                        .filter(menu => [...menu.querySelectorAll('a')].some(link => link.href.includes(`${postId}`)));

                        const author = postElement.querySelector('.username').textContent;
                        if (author !== hrefSearchUsers) {
                            const multiaccountFinderItem = document.createElement("li");
                            const buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
                            multiaccountFinderItem.innerHTML = `<a href="javascript:void(0)" id="${buttonId}">Multiaccount Finder</a>`;
                            menus[menus.length - 1].querySelector('.secondaryContent').appendChild(multiaccountFinderItem);

                            const usernameLink = postElement.querySelector('a');
                            const currentUrl = usernameLink.getAttribute('href');
                            const multiaccountFinderButton = document.getElementById(buttonId);

                            if (multiaccountFinderButton) {
                                multiaccountFinderButton.addEventListener("click", function (event) {
                                    event.preventDefault();
                                    checkUser(`https://${domain}/${currentUrl}shared-ips/`).then()
                                });
                            }
                        }
                    }
                }
            });
        });
    }
}

// ***уже оптимизирован***
function checkProfileItems() {
    const addButtonProfile = localStorage.getItem("addbutton-profile") === 'true';
    const profilePostList = document.querySelector('ol#ProfilePostList');
    if (addButtonProfile && profilePostList) {
        const linksLists = [...profilePostList.querySelectorAll(':not(li[id^="multiaccountFinderButton-"])')];
        linksLists.forEach((linksList) => {
            const links = linksList.querySelectorAll("a");
            links.forEach((link) => {
                if (link.href.startsWith(`https://${domain}/profile-posts/`)) {
                    let postId;
                    let newLink;
                    let postElement;
                    if (link.href.includes('profile-posts/comments')) {
                        postId = link.href.split('posts/comments/')[1].split('/')[0];
                        newLink = `profile-post-comment-${postId}`
                        postElement = document.querySelector(`#${newLink}.comment`);
                    } else if (!link.href.includes('profile-posts/comments/')) {
                        postId = link.href.split('profile-posts/')[1].split('/')[0];
                        newLink = `profile-post-${postId}`
                        postElement = document.querySelector(`#${newLink}.messageSimple`);
                    }
                    if (postElement && !postElement.hasAttribute("data-multiaccount-finder")) {
                        postElement.setAttribute("data-multiaccount-finder", "added");
                        const menus = [...document.querySelectorAll('div.Menu')].filter(menu => [...menu.querySelectorAll('a')].some(link => link.href.includes(`${postId}`)));
                        let author = postElement.querySelector('a.username.poster')
                        if (author.textContent !== hrefSearchUsers) {
                            const multiaccountFinderItem = document.createElement("li");
                            let buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
                            let lastid = `${buttonId}`;
                            multiaccountFinderItem.innerHTML = `<a href="javascript:void(0)" id="${lastid}">Multiaccount Finder</a>`;
                            menus[menus.length - 1].querySelector('.secondaryContent').appendChild(multiaccountFinderItem);
                            let currentUrl = author.getAttribute('href')
                            let multiaccountFinderButton = document.getElementById(lastid);
                            if (multiaccountFinderButton) {
                                multiaccountFinderButton.addEventListener("click", function (event) {
                                    event.preventDefault();
                                    checkUser(`https://${domain}/${currentUrl}shared-ips/`).then()
                                })
                            }
                        }
                    }
                }
            })
        })
    }
}

function checkAlertItems() {
    if (localStorage.getItem("addbutton-alerts") === 'true') {
        const alertElements = document.querySelectorAll('li.Alert');
        alertElements.forEach((alertElement) => {
            if (alertElement.querySelector('a[rel="menu"].PopupControl.dottesStyle.PopupContainerControl.PopupOpen')) {
                if (alertElement && !alertElement.hasAttribute("data-multiaccount-finder")) {
                    const username = alertElement.querySelector('a.username')
                    let menus = document.querySelectorAll('.Menu.MenuOpened');
                    if (!username && !menus) return;
                    const usernameLink = username.getAttribute('href');
                    const lastMenu = menus[menus.length - 1];
                    let buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
                    let lastid = `${buttonId}`;
                    const multiaccountFinderItem = document.createElement("li");
                    multiaccountFinderItem.innerHTML = `<a href="javascript:void(0)" id="${lastid}">Multiaccount Finder</a>`;
                    lastMenu.querySelector('ul.secondaryContent.blockLinksList').appendChild(multiaccountFinderItem);
                    let multiaccountFinderButton = document.getElementById(lastid);
                    if (multiaccountFinderButton) {
                        multiaccountFinderButton.addEventListener("click", function (event) {
                            event.preventDefault();
                            checkUser(`https://${domain}/${usernameLink}shared-ips/`).then()
                        })
                    }
                    alertElement.setAttribute("data-multiaccount-finder", "added");
                }
            }
        })
    }
}

function checkConversationItems() {
    if (localStorage.getItem("addbutton-conversations") === 'true') {
        if (!window.location.href.startsWith(`https://${domain}/conversations/`)) return
        const username = document.querySelector('div.ImDialogHeader a.username');
        if (!username) return
        const usernameLink = username.getAttribute('href');
        const menuElements = Array.from(document.querySelectorAll('div.Menu')).filter(menuElement => menuElement.querySelector('.blockLinksList a[href^="conversations/"]'));
        const targetElement = menuElements[menuElements.length - 1];
        if (targetElement && !targetElement.hasAttribute("data-multiaccount-finder")) {
            const multiaccountFinderItem = document.createElement("li");
            let buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
            let lastid = `${buttonId}`;
            multiaccountFinderItem.innerHTML = `<a href="javascript:void(0)" id="${lastid}">Multiaccount Finder</a>`;
            targetElement.querySelector('.blockLinksList').appendChild(multiaccountFinderItem);
            let multiaccountFinderButton = document.getElementById(lastid);
            if (multiaccountFinderButton) {
                multiaccountFinderButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    checkUser(`https://${domain}/${usernameLink}shared-ips/`).then()
                })
            }
            targetElement.setAttribute("data-multiaccount-finder", "added");
        }
    }
}

setInterval(checkMenuItems);
setInterval(checkThreadItems);
setInterval(checkProfileItems);
setInterval(checkChatItems)
setInterval(checkAlertItems)
setInterval(checkConversationItems)

function checkChatItems() {
    if (localStorage.getItem("addbutton-chat") !== 'true') return;
    const elements = document.querySelectorAll('div[class^="chat2-message-block "]');
    elements.forEach((message, index) => {
        let usernameLink;
        const lztui = document.querySelectorAll('div[class^="lztui-Popup lztng-"]');
        const lastElement = lztui[lztui.length - 1];
        const popupElement = message.querySelector('div[class^="PopupControl PopupOpen"]');
        if (!popupElement) return;

        if (message){
            usernameLink = message.querySelector('.username[href]');
            usernameLink = usernameLink && usernameLink.href.includes(profileLink) ? null : usernameLink;
            if (usernameLink) {
            } else {
                // Ищем элемент выше, пока не найдем href
                let prevIndex = index - 1;
                while (prevIndex >= 0 && !usernameLink) {
                    const prevMessage = elements[prevIndex];
                    usernameLink = prevMessage.querySelector('.username[href]');
                    prevIndex--;
                }
                if (usernameLink ){
                    console.log(usernameLink)}
            }
            const ulElement = lastElement.querySelector('ul.secondaryContent.blockLinksList');
            if (!ulElement || ulElement.hasAttribute("data-multiaccount-finder")) return;

            ulElement.setAttribute("data-multiaccount-finder", "added");
            const username = usernameLink.textContent
            const buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
            const multiaccountFinderItem = document.createElement("li");
            multiaccountFinderItem.innerHTML = `<a href="javascript:void(0)" id="${buttonId}">Multiaccount Finder</a>`;

            if (username !== hrefSearchUsers) {
                ulElement.appendChild(multiaccountFinderItem);
            }
            const multiaccountFinderButton = document.getElementById(buttonId);
            if (multiaccountFinderButton) {
                multiaccountFinderButton.addEventListener("click", function (event) {
                    event.preventDefault();
                    checkUser(`${usernameLink}shared-ips/`).then()
                });
            }
        }
    });
}

function OnlineChangeTable(classname, num) {
    const findelement = document.querySelector(`${classname}`);
    const remainedElement = document.querySelector('.remained dd');
    if (findelement) {
        const ddElement = findelement.querySelector('dd');
        if (ddElement) {
            const currentValue = parseInt(ddElement.textContent);
            ddElement.textContent = currentValue + num;
        }
    }
    if (remainedElement) {
        const currentValueRemained = parseInt(remainedElement.textContent);
        remainedElement.textContent = currentValueRemained - 1;
    }
}

// Проверяем, начинается ли текущий URL с "https://${domain}/online/?type=registered/"
if (localStorage.getItem("autocheck-online-registered") === 'true') {
    if (window.location.href.indexOf(`https://${domain}/online/?type=registered`) === 0) {
        const visitorCountDl = document.querySelector('dl.visitorCount');
        const members = document.querySelectorAll('.member');
        if (visitorCountDl && !visitorCountDl.querySelector('dl.clean')) {
            // create new div element with class 'footnote'
            const newFootnoteDiv = document.createElement('div');
            newFootnoteDiv.className = 'footnote';
            // set innerHTML of new div element to provided HTML
            if (localStorage.getItem("autocheck-only-parameters") === "true") {
                newFootnoteDiv.innerHTML = `<h3>Lolzteam Multiaccount Finder</h3><dl class="clean"><dt>Не заподозрены:</dt><dd>0</dd></dl><dl class="vpn"><dt>VPN:</dt><dd>0</dd></dl><dl class="scammers"><dt>Мошенники:</dt><dd>0</dd></dl><dl class="errors"><dt>Ошибки:</dt><dd>0</dd><dl class="skipped"><dt>Не подошли под указанные параметры:</dt><dd>0</dd></dl><dl class="remained"><dt>Осталось проверить:</dt><dd>${members.length}</dd></dl>`;
            } else {
                newFootnoteDiv.innerHTML = `<h3>Lolzteam Multiaccount Finder</h3><dl class="clean"><dt>Не заподозрены:</dt><dd>0</dd></dl><dl class="vpn"><dt>VPN:</dt><dd>0</dd></dl><dl class="scammers"><dt>Мошенники:</dt><dd>0</dd></dl><dl class="errors"><dt>Ошибки:</dt><dd>0</dd><dl class="remained"><dt>Осталось проверить:</dt><dd>${members.length}</dd></dl>`;

            }
            // append new div element to visitorCountDl
            visitorCountDl.appendChild(newFootnoteDiv);
        }

        let index = 0;
        const checkNextMember = async () => {
            if (index >= members.length) return;
            const member = members[index];
            const usernameLink = member.querySelector('a.username');
            const usernameHref = usernameLink.getAttribute('href');
            const userStatCounters = member.querySelector('.userStatCounters');
            const gifElement = document.createElement('img');
            const gifId = `gif-${index}`;
            gifElement.id = gifId;
            gifElement.src = 'https://cdn.lowgif.com/full/631c400b903c03d9-loading-gif-wpfaster.gif';
            gifElement.width = '24';
            gifElement.height = '24';
            if (usernameLink.textContent !== hrefSearchUsers) {
                const sympathies = member.querySelector("div.userStatCounters > div:nth-child(1) > span.count").textContent.replace(/ /g, "")
                const messages = member.querySelector("div.userStatCounters > div:nth-child(2) > span.count").textContent.replace(/ /g, "")

                if (localStorage.getItem("autocheck-only-parameters") === "true") {
                    if ((sympathies < parseInt(localStorage.getItem("autocheck-only-parameters-sympathies")) && messages < parseInt(localStorage.getItem("autocheck-only-parameters-messages")))
                        || (sympathies >= parseInt(localStorage.getItem("autocheck-only-parameters-sympathies")) && messages < parseInt(localStorage.getItem("autocheck-only-parameters-messages")))
                        || (sympathies < parseInt(localStorage.getItem("autocheck-only-parameters-sympathies")) && messages >= parseInt(localStorage.getItem("autocheck-only-parameters-messages")))) {
                        userStatCounters.appendChild(gifElement);
                        await checkUser(`https://zelenka.guru/${usernameHref}shared-ips`, 'registered', gifId);
                    } else {
                        OnlineChangeTable('dl.skipped', 1)
                    }
                } else {
                    userStatCounters.appendChild(gifElement);
                    await checkUser(`https://zelenka.guru/${usernameHref}shared-ips`, 'registered', gifId);
                }
            } else {
                OnlineChangeTable('dl.skipped', 0)
            }
            index++;
            await checkNextMember();
        }

        checkNextMember().then();
    }
}

// Проверяем, начинается ли текущий URL с "https://${domain}/members/"
if (localStorage.getItem("autocheck-newmembers") === 'true' && window.location.href.indexOf(`https://${domain}/members/`) === 0) {
    const visitorCountDl = document.querySelector('dl.memberCount');

    const members = document.querySelectorAll('.secondaryContent.avatarHeap.avatarList li');
    if (visitorCountDl && !visitorCountDl.querySelector('dl.clean')) {
        // create new div element with class 'footnote'
        const newFootnoteDiv = document.createElement('div');
        newFootnoteDiv.className = 'footnote';
        // set innerHTML of new div element to provided HTML
        newFootnoteDiv.innerHTML = `<h3>Lolzteam Multiaccount Finder</h3><dl class="clean"><dt>Не заподозрены:</dt><dd>0</dd></dl><dl class="vpn"><dt>VPN:</dt><dd>0</dd></dl><dl class="scammers"><dt>Мошенники:</dt><dd>0</dd></dl><dl class="errors"><dt>Ошибки:</dt><dd>0</dd></dl><dl class="remained"><dt>Осталось проверить:</dt><dd>${members.length}</dd></dl>`;
        // append new div element to visitorCountDl
        visitorCountDl.appendChild(newFootnoteDiv);
    }
    let index = 0;
    const checkNextMember = async () => {
        if (index >= members.length) return;
        const member = members[index];
        const usernameLink = member.querySelector('a.username');
        const usernameHref = usernameLink.getAttribute('href');
        const userStatCounters = member.querySelector('div.memberInfo');
        const gifElement = document.createElement('img');
        const gifId = `gif-${index}`;
        gifElement.id = gifId;
        gifElement.src = 'https://cdn.lowgif.com/full/631c400b903c03d9-loading-gif-wpfaster.gif';
        gifElement.width = '24';
        gifElement.height = '24';
        userStatCounters.appendChild(gifElement);
        await checkUser(`https://zelenka.guru/${usernameHref}shared-ips`, 'members', gifId);
        index++;
        await checkNextMember();
    }
    checkNextMember().then()
}

function xenforoLogAndAlert(text, title) {
    console.log(text)
    XenForo.alert(`${text}`, `${title}`)
}

// ***уже оптимизирован***
function checkUser(link, source, gifId) {
    console.log(gifId)
    console.log(`${link.replace(/(https:\/\/.*?)\/\//g, '$1/')}`)
    return fetch(`${link.replace(/(https:\/\/.*?)\/\//g, '$1/')}`)
        .then(response => response.text())
        .then(data => {
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(data, "text/html");
        const userLogs = htmlDocument.getElementsByClassName("userLog");
        let bannedUsersCount = 0;
        let nonBannedUsersCount = 0;
        let bannedThisMonthCount = 0;
        const numUserLogs = userLogs.length;
        //console.log(userLogs)
        //console.log(numUserLogs);
        const nameEl = htmlDocument.querySelector(`a.crumb[href^="https://${domain}/"] span`);
        const name = nameEl ? nameEl.textContent.trim() : "";
        console.log(name)
        const gifElement = document.getElementById(gifId);
        if (!name) {
            //console.log("Name not found. Skipping further checks.");
            if (gifElement) {
                gifElement.src = 'https://i.imgur.com/wqXWudH.png'; // подгружаем иконку ошибки с imgur
            }
            OnlineChangeTable('dl.errors', 1)
            throw new Error("Name not found");
        }

        for (let i = 0; i < userLogs.length; i++) {
            const spans = userLogs[i].getElementsByTagName("span");
            let isBanned = false;
            for (let j = 0; j < spans.length; j++) {
                if (spans[j].classList.contains("banned")) {
                    bannedUsersCount++;
                    isBanned = true;
                    const li = userLogs[i].querySelector('li.ipLog');
                    if (li) {
                        const abbr = li.querySelector('abbr.DateTime');
                        const span = li.querySelector('span.DateTime');
                        if (abbr || span) {
                            const title = abbr ? abbr.getAttribute("data-datestring") : span.getAttribute("title");
                            if (title.includes(month) || title.includes('Сегодня') || title.includes('Вчера')) {
                                //console.log(title);
                                bannedThisMonthCount++;
                            }
                        }
                    }
                    break;
                }
            }
            if (!isBanned) {
                nonBannedUsersCount++;
            }
        }

        if (!link.replace('/shared-ips', '').includes(domain)) {
            link = `https://${domain}/${link.replace('/shared-ips', '')}`;
        }

        const totalUsers = bannedUsersCount + nonBannedUsersCount;
        const bannedPercent = totalUsers ? ((bannedUsersCount / totalUsers) * 100).toFixed(2) : 0;
        const nonBannedPercent = totalUsers ? ((nonBannedUsersCount / totalUsers) * 100).toFixed(2) : 0;
        const bannedThisMonthPercent = bannedUsersCount ? ((bannedThisMonthCount / bannedUsersCount) * 100).toFixed(2) : 0; // вычисляем процент заблокированных в текущем месяце
        const [showBlockedPercentage, showUnblockedPercentage, showTotalUsersIp, showBlockedThisMonthPercentage] = ["show-blocked-percentage", "show-unblocked-percentage", "show-total-users-ip", "show-blocked-this-month-percentage"].map(item => localStorage.getItem(item) === "true");

        let output = "";
        output += (showBlockedPercentage) ? `\n% заблокированных: ${bannedPercent} (${bannedUsersCount})` : '';
        output += (showUnblockedPercentage) ? `\n% не заблокированных: ${nonBannedPercent} (${nonBannedUsersCount})` : '';
        output += (showTotalUsersIp) ? `\nОбщее количество пользователей в общих IP: ${numUserLogs}` : '';
        output += (showBlockedThisMonthPercentage) ? `\n% от заблокированных в этом месяце: ${bannedThisMonthPercent} (${bannedThisMonthCount})` : '';

        function template(description) {
            const template = `https://${domain}/forums/801/create-thread?prefix_id=92&title=%D0%96%D0%B0%D0%BB%D0%BE%D0%B1%D0%B0+%D0%BD%D0%B0+%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8F+${name}&message=[CLUB]1.+%D0%9D%D0%B8%D0%BA%D0%BD%D0%B5%D0%B9%D0%BC+%D0%BD%D0%B0%D1%80%D1%83%D1%88%D0%B8%D1%82%D0%B5%D0%BB%D1%8F+%D0%B8+%D1%81%D1%81%D1%8B%D0%BB%D0%BA%D0%B0+%D0%BD%D0%B0+%D0%BF%D1%80%D0%BE%D1%84%D0%B8%D0%BB%D1%8C%3A+${link.replace(`/shared-ips`, ``)}%2F%0A2.+%D0%9A%D1%80%D0%B0%D1%82%D0%BA%D0%BE%D0%B5+%D0%BE%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5+%D0%B6%D0%B0%D0%BB%D0%BE%D0%B1%D1%8B%3A ${description}%0A3.+%D0%94%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D1%81%D1%82%D0%B2%D0%B0%3A ${link.replace(`/shared-ips`, ``)}/shared-ips[/CLUB]`;
            window.location.href = `${template}`
        }

        if (htmlDocument.body.textContent.includes("Пользователей по заданным параметрам не найдено.") ||
            htmlDocument.body.textContent.includes("No matching users were found.")) {
            gifElement && (gifElement.src = 'https://i.imgur.com/i4OlWJk.png');
            output = `${name} - пользователей по заданным параметрам не найдено.`
            gifElement && (gifElement.title = `${output}`);
            !gifElement && xenforoLogAndAlert(`${output}`, `Lolzteam Multiaccount Finder`);
            if (source === 'members' || source === 'registered') OnlineChangeTable('dl.clean', 1);

        } else if (bannedUsersCount >= nonBannedUsersCount && bannedUsersCount !== 0) {
            output = output ? `${name} - мошенник ${output}` : `${name} - мошенник`;
            if (gifElement) {
                gifElement.addEventListener('click', function () {
                    // при нажатии на красный треугольник доступ к быстрому созданию темы
                    template(`${name}%20-%20%D0%BC%D0%BE%D1%88%D0%B5%D0%BD%D0%BD%D0%B8%D0%BA%0A%25%20%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%3A%20${bannedPercent} (${bannedUsersCount}) %0A%25%20%D0%BD%D0%B5%20%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%3A%20${nonBannedPercent} (${nonBannedUsersCount}) %0A%D0%9E%D0%B1%D1%89%D0%B5%D0%B5%20%D0%BA%D0%BE%D0%BB%D0%B8%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%BE%20%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D0%B5%D0%B9%20%D0%B2%20%D0%BE%D0%B1%D1%89%D0%B8%D1%85%20IP%3A%20${numUserLogs}%0A%25%20%D0%BE%D1%82%20%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%20%D0%B2%20%D1%8D%D1%82%D0%BE%D0%BC%20%D0%BC%D0%B5%D1%81%D1%8F%D1%86%D0%B5%3A%20${bannedThisMonthPercent} (${bannedThisMonthCount}) `)
                });
                gifElement.src = 'https://i.imgur.com/g5GxNHD.png';
                gifElement.style.cursor = 'pointer';
                gifElement.title = `${output}`
                if (source === 'members' || source === 'registered') OnlineChangeTable('dl.scammers', 1);
            } else {
                xenforoLogAndAlert(`${output}`, `Lolzteam Multiaccount Finder`);
            }

        } else if (nonBannedUsersCount > 15 && bannedUsersCount < nonBannedUsersCount / 3) {
            gifElement && (gifElement.src = 'https://i.imgur.com/o5qNA1o.png');
            output = output ? `${name} - использует VPN ${output}` : `${name} - использует VPN`;
            gifElement && (gifElement.title = `${output}`);
            !gifElement && xenforoLogAndAlert(`${output}`, `Lolzteam Multiaccount Finder`);
            if (source === 'members' || source === 'registered') OnlineChangeTable('dl.vpn', 1);

        } else if (nonBannedUsersCount > 6 && nonBannedUsersCount <= 15 && bannedUsersCount < nonBannedUsersCount / 2) {
            gifElement && (gifElement.src = 'https://i.imgur.com/o5qNA1o.png');
            output = output ? `${name} - возможно использует VPN ${output}` : `${name} - возможно использует VPN`;
            gifElement && (gifElement.title = `${output}`);
            !gifElement && xenforoLogAndAlert(`${output}`, `Lolzteam Multiaccount Finder`);
            if (source === 'members' || source === 'registered') OnlineChangeTable('dl.vpn', 1);

        } else if (bannedUsersCount > nonBannedUsersCount / 2) {
            output = output ? `${name} - возможно мошенник ${output}` : `${name} - возможно мошенник`;
            if (gifElement) {
                gifElement.addEventListener('click', function () {
                    // при нажатии на красный треугольник доступ к быстрому созданию темы
                    template(`${name}%20-%20%D0%B2%D0%BE%D0%B7%D0%BC%D0%BE%D0%B6%D0%BD%D0%BE%20%D0%BC%D0%BE%D1%88%D0%B5%D0%BD%D0%BD%D0%B8%D0%BA%0A%25%20%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%3A%20${bannedPercent} (${bannedUsersCount}) %0A%25%20%D0%BD%D0%B5%20%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%3A%20${nonBannedPercent} (${nonBannedUsersCount}) %0A%D0%9E%D0%B1%D1%89%D0%B5%D0%B5%20%D0%BA%D0%BE%D0%BB%D0%B8%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%BE%20%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D0%B5%D0%B9%20%D0%B2%20%D0%BE%D0%B1%D1%89%D0%B8%D1%85%20IP%3A%20${numUserLogs}%0A%25%20%D0%BE%D1%82%20%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%20%D0%B2%20%D1%8D%D1%82%D0%BE%D0%BC%20%D0%BC%D0%B5%D1%81%D1%8F%D1%86%D0%B5%3A%20${bannedThisMonthPercent} (${bannedThisMonthCount}) `)
                });
                gifElement.src = 'https://i.imgur.com/g5GxNHD.png';
                gifElement.style.cursor = 'pointer';
                gifElement.title = `${output}`
                if (source === 'members' || source === 'registered') OnlineChangeTable('dl.scammers', 1);
            } else {
                xenforoLogAndAlert(`${output}`, `Lolzteam Multiaccount Finder`);
            }
        } else {
            gifElement && (gifElement.src = 'https://i.imgur.com/i4OlWJk.png');
            output = output ? `${name} - мультиаккаунт ${output}` : `${name} - мультиаккаунт`;
            gifElement && (gifElement.title = `${output}`);
            !gifElement && xenforoLogAndAlert(`${output}`, `Lolzteam Multiaccount Finder`);
            if (source === 'members' || source === 'registered') OnlineChangeTable('dl.clean', 1);
        }
    })
        .catch(error => console.error(error));
}
