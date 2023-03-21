// ==UserScript==
// @name         Lolzteam Multiaccount Finder
// @version      0.9.1
// @description  Your assistant in finding scammers on the forum
// @author       vuchaev2015
// @match        https://zelenka.guru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zelenka.guru
// @grant        none
// @namespace http://tampermonkey.net/
// ==/UserScript==

var domain = 'zelenka.guru'
var items = [
    {key: "autocheck-mini-profile", value: "false"},
    {key: "autocheck-profile", value: "false"},
    {key: "autocheck-banned-users-mporp", value: "false"},
    {key: "addbutton-profile", value: "true"},
    {key: "addbutton-threads", value: "true"}
];

items.forEach(function(item) {
    if (!localStorage.getItem(item.key)) {
        localStorage.setItem(item.key, item.value);
    }
});

var accountMenu = document.getElementById("AccountMenu");
var linksList = accountMenu.querySelector(".blockLinksList");
var buttonId = `lmfsettings`;

linksList.insertAdjacentHTML('beforeend', `<li><a href="javascript:void(0)" id="${buttonId}">Multiaccount Finder</a></li>`);

document.getElementById(buttonId).addEventListener("click", function (event) {
    event.preventDefault();
    openSettings();
});

var hrefSearchUsers = document.querySelector('a[href^="/search/search?users="]').href.split('?users=')[1].split('&')[0];

// ***вроде оптимизирован более-менее***
// Меню с настройками
function openSettings() {
    var unixtime = Math.floor(Date.now() / 1000); // Получаем текущее время в секундах

    var isCheckedProfile = localStorage.getItem("autocheck-profile") === "true";
    var chkboxProfile = '<input type="checkbox" id="autocheck-profile-' + unixtime + '" name="autocheck-profile-' + unixtime + '" ' + (isCheckedProfile ? 'checked="checked" ' : '') + 'value="1"> Автоматическая проверка в профилях<div></div>';

    var isCheckedMiniProfile = localStorage.getItem("autocheck-mini-profile") === "true";
    var chkboxMiniProfile = '<br><div> <input type="checkbox" id="autocheck-mini-profile-' + unixtime + '" name="autocheck-mini-profile-' + unixtime + '" ' + (isCheckedMiniProfile ? 'checked="checked" ' : '') + 'value="1"> Автоматическая проверка в мини-профилях </div>';

    var isCheckedBannedUsers = localStorage.getItem("autocheck-banned-users-mporp") === "true";
    var chkboxBannedUsers = '<br><div> <input type="checkbox" id="autocheck-banned-users-mporp-' + unixtime + '" name="autocheck-banned-users-mporp-' + unixtime + '" ' + (isCheckedBannedUsers ? 'checked="checked" ' : '') + 'value="1"> Автоматически проверять заблокированных </div>';

    var isCheckedAddButtonThreads = localStorage.getItem("addbutton-threads") === "true";
    var chkboxAddButtonThreads = '<br><div> <input type="checkbox" id="addbutton-threads-' + unixtime + '" name="addbutton-threads-' + unixtime + '" ' + (isCheckedAddButtonThreads ? 'checked="checked" ' : '') + 'value="1"> Добавить кнопку на постах и комментариях в темах </div>';

    var isCheckedAddButtonProfile = localStorage.getItem("addbutton-profile") === "true";
    var chkboxAddButtonProfile = '<br><div> <input type="checkbox" id="addbutton-profile-' + unixtime + '" name="addbutton-profile-' + unixtime + '" ' + (isCheckedAddButtonProfile ? 'checked="checked" ' : '') + 'value="1"> Добавить кнопку на постах и комментариях в профиле </div>';

    var content = chkboxProfile  + chkboxMiniProfile + chkboxBannedUsers + chkboxAddButtonThreads + chkboxAddButtonProfile;
    XenForo.alert(content, 'Lolzteam Multiaccount Finder');

    var checkboxes = [
        "autocheck-profile-" + unixtime,
        "autocheck-mini-profile-" + unixtime,
        "autocheck-banned-users-mporp-" + unixtime,
        "addbutton-threads-" + unixtime,
        "addbutton-profile-" + unixtime
    ];

    checkboxes.forEach(function(id) {
        var checkbox = document.getElementById(id);
        checkbox.addEventListener('change', function() {
            localStorage.setItem(this.id.replace(/-\d+$/, ''), `${this.checked}`);
            console.log(this.id.replace(/-\d+$/, ''))
            console.log(`${this.checked}`);
        });
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
                checkUser(currentUrl);
            })
        }
        const makeClaimLink = menu.querySelector('a[href*="/make-claim"]');
        if (makeClaimLink) {
            if (localStorage.getItem("autocheck-mini-profile") !== 'true') return;
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
                const countsModule = document.querySelectorAll('.userStatCounters, .counts_module');
                countsModule.forEach(module => {
                    const miniprofileMenu = module.parentNode.parentNode;
                    if (miniprofileMenu.hasAttribute("data-multiaccount-finder")) return;
                    miniprofileMenu.setAttribute("data-multiaccount-finder", "added");
                    module.appendChild(gifElement);
                    if (localStorage.getItem("autocheck-banned-users-mporp") === 'false' && bannedcheck.querySelector('.banInfo.muted.Tooltip') || bannedcheck.querySelector('div.errorPanel')) {
                        const element = document.getElementById(gifId);
                        if (element) element.remove();
                        return;
                    }
                    const element = document.getElementById(buttonId);
                    if (element) element.remove();
                    checkUser(currentUrl, gifId);
                });
            });
        } else {
            if (localStorage.getItem("autocheck-profile") !== 'true') return;
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
                    module.appendChild(gifElement);
                    if (localStorage.getItem("autocheck-banned-users-mporp") === 'false' && bannedcheck.querySelector('div.errorPanel')) {
                        const element = document.getElementById(gifId);
                        if (element) element.remove();
                        return;
                    }
                    const element = document.getElementById(buttonId);
                    if (element) element.remove();
                    checkUser(currentUrl, gifId);
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
                                    checkUser(`https://${domain}/${currentUrl}shared-ips/`)
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
                                    checkUser(`https://${domain}/${currentUrl}shared-ips/`)
                                })
                            }
                        }
                    }
                }
            })
        })
    }
}

setInterval(checkMenuItems);
setInterval(checkThreadItems);
setInterval(checkProfileItems);

function xenforoLogAndAlert(text, title) {
    console.log(text)
    XenForo.alert(`${text}`, `${title}`)
}

// ***уже оптимизирован***
function checkUser(link, gifId) {
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
        const numUserLogs = userLogs.length;
        console.log(userLogs)
        console.log(numUserLogs);
        const nameEl = htmlDocument.querySelector(`a.crumb[href^="https://${domain}/"] span`);
        const name = nameEl ? nameEl.textContent.trim() : "";

        const gifElement = document.getElementById(gifId);
        if (!name) {
            //console.log("Name not found. Skipping further checks.");
            if (gifElement) {
                gifElement.src = 'https://i.imgur.com/wqXWudH.png'; // подгружаем иконку ошибки с imgur
            }
            throw new Error("Name not found");
        }

        for (let i = 0; i < userLogs.length; i++) {
            const spans = userLogs[i].getElementsByTagName("span");
            let isBanned = false;
            for (let j = 0; j < spans.length; j++) {
                if (spans[j].classList.contains("banned")) {
                    bannedUsersCount++;
                    isBanned = true;
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

        const scammer = `${name} - мошенник\n% заблокированных: ${bannedPercent}\n% не заблокированных: ${nonBannedPercent}\nОбщее количество пользователей в общих IP: ${numUserLogs}`
        const mbscammer = `${name} - возможно мошенник\n% заблокированных: ${bannedPercent}\n% не заблокированных: ${nonBannedPercent}\nОбщее количество пользователей в общих IP: ${numUserLogs}`
        const vpn = `${name} - использует VPN\n% заблокированных: ${bannedPercent}\n% не заблокированных: ${nonBannedPercent}\nОбщее количество пользователей в общих IP: ${numUserLogs}`
        const mbvpn = `${name} - возможно использует VPN\n% заблокированных: ${bannedPercent}\n% не заблокированных: ${nonBannedPercent}\nОбщее количество пользователей в общих IP: ${numUserLogs}`
        const cleaned = `${name} - пользователи по заданным параметрам не найдены`
        const multiaccount = `${name} - мультиаккаунт\n% заблокированных: ${bannedPercent}\n% не заблокированных: ${nonBannedPercent}\nОбщее количество пользователей в общих IP: ${numUserLogs}`

        function template(description) {
            const template = `https://${domain}/forums/801/create-thread?title=%D0%96%D0%B0%D0%BB%D0%BE%D0%B1%D0%B0+%D0%BD%D0%B0+%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8F+${name}&message=1.+%D0%9D%D0%B8%D0%BA%D0%BD%D0%B5%D0%B9%D0%BC+%D0%BD%D0%B0%D1%80%D1%83%D1%88%D0%B8%D1%82%D0%B5%D0%BB%D1%8F+%D0%B8+%D1%81%D1%81%D1%8B%D0%BB%D0%BA%D0%B0+%D0%BD%D0%B0+%D0%BF%D1%80%D0%BE%D1%84%D0%B8%D0%BB%D1%8C%3A+${link.replace(`/shared-ips`, ``)}%2F%0A2.+%D0%9A%D1%80%D0%B0%D1%82%D0%BA%D0%BE%D0%B5+%D0%BE%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5+%D0%B6%D0%B0%D0%BB%D0%BE%D0%B1%D1%8B%3A ${description}%0A3.+%D0%94%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D1%81%D1%82%D0%B2%D0%B0%3A ${link.replace(`/shared-ips`, ``)}/shared-ips`;
            window.location.href = `${template}`
        }


        if (htmlDocument.body.textContent.includes("Пользователей по заданным параметрам не найдено.") ||
            htmlDocument.body.textContent.includes("No matching users were found.")) {
            gifElement && (gifElement.src = 'https://i.imgur.com/i4OlWJk.png');
            gifElement && (gifElement.title = `${cleaned}`);
            !gifElement && xenforoLogAndAlert(`${cleaned}`, `Lolzteam Multiaccount Finder`);

        } else if (bannedUsersCount >= nonBannedUsersCount && bannedUsersCount !== 0) {
            if (gifElement) {
                gifElement.addEventListener('click', function() {
                    // при нажатии на красный треугольник доступ к быстрому созданию темы
                    template(`${name}%20-%20%D0%BC%D0%BE%D1%88%D0%B5%D0%BD%D0%BD%D0%B8%D0%BA%0A%25%20%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%3A%20${bannedPercent}%0A%25%20%D0%BD%D0%B5%20%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%3A%20${nonBannedPercent}%0A%D0%9E%D0%B1%D1%89%D0%B5%D0%B5%20%D0%BA%D0%BE%D0%BB%D0%B8%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%BE%20%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D0%B5%D0%B9%20%D0%B2%20%D0%BE%D0%B1%D1%89%D0%B8%D1%85%20IP%3A%20${numUserLogs}`)
                });
                gifElement.src = 'https://i.imgur.com/g5GxNHD.png';
                gifElement.style.cursor = 'pointer';
                gifElement.title = `${scammer}`
            } else {
                xenforoLogAndAlert(`${scammer}`, `Lolzteam Multiaccount Finder`);
            }

        } else if (nonBannedUsersCount > 15 && bannedUsersCount < nonBannedUsersCount / 3) {
            gifElement && (gifElement.src = 'https://i.imgur.com/o5qNA1o.png');
            gifElement && (gifElement.title = `${vpn}`);
            !gifElement && xenforoLogAndAlert(`${vpn}`, `Lolzteam Multiaccount Finder`);

        } else if (nonBannedUsersCount > 6 && nonBannedUsersCount <= 15 && bannedUsersCount < nonBannedUsersCount / 2) {
            gifElement && (gifElement.src = 'https://i.imgur.com/o5qNA1o.png');
            gifElement && (gifElement.title = `${mbvpn}`);
            !gifElement && xenforoLogAndAlert(`${mbvpn}`, `Lolzteam Multiaccount Finder`);

        } else if (bannedUsersCount > nonBannedUsersCount / 2) {
            if (gifElement) {
                gifElement.addEventListener('click', function() {
                    // при нажатии на красный треугольник доступ к быстрому созданию темы
                    template(`${name}%20-%20%D0%B2%D0%BE%D0%B7%D0%BC%D0%BE%D0%B6%D0%BD%D0%BE%20%D0%BC%D0%BE%D1%88%D0%B5%D0%BD%D0%BD%D0%B8%D0%BA%0A%25%20%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%3A%20${bannedPercent}%0A%25%20%D0%BD%D0%B5%20%D0%B7%D0%B0%D0%B1%D0%BB%D0%BE%D0%BA%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85%3A%20${nonBannedPercent}%0A%D0%9E%D0%B1%D1%89%D0%B5%D0%B5%20%D0%BA%D0%BE%D0%BB%D0%B8%D1%87%D0%B5%D1%81%D1%82%D0%B2%D0%BE%20%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D0%B5%D0%B9%20%D0%B2%20%D0%BE%D0%B1%D1%89%D0%B8%D1%85%20IP%3A%20${numUserLogs}`)
                });
                gifElement.src = 'https://i.imgur.com/g5GxNHD.png';
                gifElement.style.cursor = 'pointer';
                gifElement.title = `${mbscammer}`
            } else {
                xenforoLogAndAlert(`${mbscammer}`, `Lolzteam Multiaccount Finder`);
            }

        } else {
            gifElement && (gifElement.src = 'https://i.imgur.com/i4OlWJk.png');
            gifElement && (gifElement.title = `${multiaccount}`);
            !gifElement && xenforoLogAndAlert(`${multiaccount}`, `Lolzteam Multiaccount Finder`);
        }
    })
        .catch(error => console.error(error));
}
