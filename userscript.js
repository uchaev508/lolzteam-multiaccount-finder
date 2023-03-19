// ==UserScript==
// @name         Lolzteam Multiaccount Finder
// @version      0.8
// @description  Your assistant in finding scammers on the forum
// @author       vuchaev2015
// @match        https://zelenka.guru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zelenka.guru
// @grant        none
// @namespace http://tampermonkey.net/
// ==/UserScript==

var domain = 'zelenka.guru'

if (!localStorage.getItem("autocheck-mini-profile")) {
    localStorage.setItem("autocheck-mini-profile", "false");
}
if (!localStorage.getItem("autocheck-profile")) {
    localStorage.setItem("autocheck-profile", "false");
}
if (!localStorage.getItem("autocheck-banned-users-mporp")) {
    localStorage.setItem("autocheck-banned-users-mporp", "false");
}

// Находим элемент с ID AccountMenu
var accountMenu = document.getElementById("AccountMenu");

// Создаем новый пункт списка
var newListItem = document.createElement("li");
var buttonId = `lmfsettings`; // generate a unique button ID
newListItem.innerHTML = `<a href="javascript:void(0)" id="${buttonId}">Multiaccount Finder</a>`;

// Добавляем новый пункт в список
var linksList = accountMenu.querySelector(".blockLinksList");
linksList.appendChild(newListItem);

// Добавляем обработчик события клика на новый пункт меню
var multiaccountFinderButton = document.getElementById(buttonId);
multiaccountFinderButton.addEventListener("click", function (event) {
    event.preventDefault();
    openSettings();
});

var navigationUsername = document.getElementById('NavigationAccountUsername').textContent;

// Меню с настройками
function openSettings() {
    var unixtime = Math.floor(Date.now() / 1000); // Получаем текущее время в секундах

    var isCheckedProfile = localStorage.getItem("autocheck-profile") === "true";
    var chkboxProfile = '<input type="checkbox" id="autocheck-profile-' + unixtime + '" name="autocheck-profile-' + unixtime + '" ' + (isCheckedProfile ? 'checked="checked" ' : '') + 'value="1"> Автоматическая проверка в профилях<div></div>';

    var isCheckedMiniProfile = localStorage.getItem("autocheck-mini-profile") === "true";
    var chkboxMiniProfile = '<div> <input type="checkbox" id="autocheck-mini-profile-' + unixtime + '" name="autocheck-mini-profile-' + unixtime + '" ' + (isCheckedMiniProfile ? 'checked="checked" ' : '') + 'value="1"> Автоматическая проверка в мини-профилях </div>';

    var isCheckedBannedUsers = localStorage.getItem("autocheck-banned-users-mporp") === "true";
    var chkboxBannedUsers = '<div> <input type="checkbox" id="autocheck-banned-users-mporp-' + unixtime + '" name="autocheck-banned-users-mporp-' + unixtime + '" ' + (isCheckedBannedUsers ? 'checked="checked" ' : '') + 'value="1"> Автоматически проверять заблокированных </div>';

    var content = chkboxProfile  + chkboxMiniProfile + chkboxBannedUsers;
    XenForo.alert(content, 'Lolzteam Multiaccount Finder');

    var checkboxProfile = document.getElementById("autocheck-profile-" + unixtime);
    checkboxProfile.addEventListener("change", function() {
        localStorage.setItem("autocheck-profile" , checkboxProfile.checked);
        console.log(localStorage); // Выводим содержимое localStorage в консоль
    });

    var checkboxMiniProfile = document.getElementById("autocheck-mini-profile-" + unixtime);
    checkboxMiniProfile.addEventListener("change", function() {
        localStorage.setItem("autocheck-mini-profile" , checkboxMiniProfile.checked);
        console.log(localStorage); // Выводим содержимое localStorage в консоль
    });

    var checkboxBannedUsers = document.getElementById("autocheck-banned-users-mporp-" + unixtime);
    checkboxBannedUsers.addEventListener("change", function() {
        localStorage.setItem("autocheck-banned-users-mporp" , checkboxBannedUsers.checked);
        console.log(localStorage); // Выводим содержимое localStorage в консоль
    });
}

// Добавляем кнопку Multiaccount Finder в профиле и мини профиле если присутствует кнопка shared-ips
function checkMenuItems() {
    let sharedItems = document.querySelectorAll('.Menu a');
    sharedItems.forEach(function (item) {
        if (item.getAttribute('href') && item.getAttribute('href').includes('/shared-ips')) {
            let menu = item.parentNode.parentNode;
            if (!menu.hasAttribute("data-multiaccount-finder")) {
                let newMenuItem = document.createElement("li");
                let buttonId = `multiaccountFinderButton-${Date.now()}`; // generate a unique button ID
                let lastid = `${buttonId}`
                menu.setAttribute("data-multiaccount-finder", "added");
                newMenuItem.innerHTML = `<a href="javascript:void(0)" id="${lastid}">Multiaccount Finder</a>`;
                menu.appendChild(newMenuItem);
                let currentUrl = window.location.href;
                currentUrl = item.getAttribute("href");
                let multiaccountFinderButton = document.getElementById(buttonId);
                if (multiaccountFinderButton) {
                    multiaccountFinderButton.addEventListener("click", function (event) {
                        event.preventDefault();
                        checkUser(`${currentUrl}`);
                    })
                }

                let makeClaimLink = menu.querySelector('a[href*="/make-claim"]');
                if (makeClaimLink) {
                    if (localStorage.getItem("autocheck-mini-profile") === 'true') { // проверка включенного авточека в мини профиле
                        const bannedModule = document.querySelectorAll('.usernameAndStatus');
                        bannedModule.forEach(function(module){
                            let bannedcheck = module.parentNode.parentNode; // проверка на заблокированного пользователя
                            if (!bannedcheck.hasAttribute("data-multiaccount-finder")) {
                                bannedcheck.setAttribute("data-multiaccount-finder", "added");
                                const countsModule = document.querySelectorAll('.userStatCounters');
                                const gifElement = document.createElement('img');
                                const gifId = `gif-profile-${Date.now()}`;
                                gifElement.id = gifId;
                                gifElement.src = 'https://cdn.lowgif.com/full/631c400b903c03d9-loading-gif-wpfaster.gif';
                                gifElement.width = '24';
                                gifElement.height = '24';
                                gifElement.title = '';
                                // перебираем элементы userStatCounters
                                countsModule.forEach(function(module){
                                    let miniprofileMenu = module.parentNode.parentNode;
                                    if (!miniprofileMenu.hasAttribute("data-multiaccount-finder")) {
                                        miniprofileMenu.setAttribute("data-multiaccount-finder", "added");
                                        const element = document.getElementById(lastid); // находим элемент по
                                        if (element) { // проверяем, что элемент найден
                                            element.remove(); // удаляем элемент
                                        }
                                        module.appendChild(gifElement);
                                        if (localStorage.getItem("autocheck-banned-users-mporp") === 'false') {
                                            if (!bannedcheck.querySelector('.banInfo.muted.Tooltip')) {
                                                checkUser(`${currentUrl}`, gifId);
                                            } else {
                                                const element = document.getElementById(gifId); // находим элемент по id
                                                if (element) { // проверяем, что элемент gif найден
                                                    element.remove(); // удаляем элемент gif из мини профиля
                                                    newMenuItem.innerHTML = `<a href="javascript:void(0)" id="${lastid}">Multiaccount Finder</a>`;
                                                    menu.appendChild(newMenuItem);
                                                }
                                            }
                                        }
                                        // если указан True autocheck-banned-users-mporp
                                        else {
                                            checkUser(`${currentUrl}`, gifId);
                                        }
                                    }
                                });
                            }
                        });
                    }
                } else {
                    if (localStorage.getItem("autocheck-profile") === 'true') { // проверка включенного авточека в обычном профиле
                        const bannedModule = document.querySelectorAll('div.mainProfileColumn');
                        bannedModule.forEach(function(module){
                            let bannedcheck = module.parentNode.parentNode; // проверка на заблокированного пользователя
                            if (!bannedcheck.hasAttribute("data-multiaccount-finder")) {
                                bannedcheck.setAttribute("data-multiaccount-finder", "added");
                                const countsModule = document.querySelectorAll('.counts_module');
                                const gifElement = document.createElement('img');
                                const gifId = `gif-profile`;
                                gifElement.id = gifId;
                                gifElement.src = 'https://cdn.lowgif.com/full/631c400b903c03d9-loading-gif-wpfaster.gif';
                                gifElement.width = '32';
                                gifElement.height = '32';
                                gifElement.title = '';
                                countsModule.forEach(function(module){
                                    let profilecounter = module.parentNode.parentNode;
                                    if (!profilecounter.hasAttribute("data-multiaccount-finder")) {
                                        profilecounter.setAttribute("data-multiaccount-finder", "added");
                                        const element = document.getElementById(lastid); // находим элемент по id
                                        if (element) { // проверяем, что элемент найден
                                            element.remove(); // удаляем элемент
                                        }
                                        module.appendChild(gifElement);
                                        if (localStorage.getItem("autocheck-banned-users-mporp") === 'false') {
                                            if (!bannedcheck.querySelector('div.errorPanel')) {
                                                checkUser(`${currentUrl}`, gifId);
                                            } else {
                                                const element = document.getElementById(gifId); // находим элемент по id
                                                if (element) { // проверяем, что элемент gif найден
                                                    element.remove(); // удаляем элемент gif из профиля
                                                    newMenuItem.innerHTML = `<a href="javascript:void(0)" id="${lastid}">Multiaccount Finder</a>`;
                                                    menu.appendChild(newMenuItem);
                                                }
                                            }
                                        }
                                        // если указан True autocheck-banned-users-mporp
                                        else {
                                            checkUser(`${currentUrl}`, gifId);
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }
    })
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

function checkThreadItems() {
    // Проверяем, начинается ли текущий URL с "https://zelenka.guru/threads/"
    if (window.location.href.indexOf(`https://${domain}/threads/`) === 0) {
        // Получаем все элементы с классом "secondaryContent blockLinksList"
        const linksLists = document.querySelectorAll(".secondaryContent.blockLinksList");

        // Проходимся по каждому элементу и добавляем пункт "Multiaccount Finder"
        linksLists.forEach((linksList) => {
            let links = linksList.querySelectorAll("a");
            links.forEach((link) => {
                if (link.href.startsWith(`https://${domain}/posts/`)) {

                    let postId;
                    let newLink;
                    let postElement;

                    if (link.href.includes('posts/comments/')) {
                        postId = link.href.split('posts/comments/')[1].split('/')[0];
                        newLink = `post-comment-${postId}`
                        postElement = document.querySelector(`#${newLink}.comment`);
                    }
                    if (!link.href.includes('posts/comments/')) {
                        postId = link.href.split('posts/')[1].split('/')[0];
                        newLink = `post-${postId}`
                        postElement = document.querySelector(`#${newLink}.message`);
                    }
                    if (postElement) {
                        if (!postElement.hasAttribute("data-multiaccount-finder")) {
                            postElement.setAttribute("data-multiaccount-finder", "added");
                            if(postElement){
                                let author = postElement.querySelector('.username').textContent;
                                if (author !== `${navigationUsername}`) {
                                    console.log(author)
                                    console.log(newLink)
                                    const multiaccountFinderItem = document.createElement("li");
                                    let buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
                                    let lastid = `${buttonId}`;
                                    multiaccountFinderItem.innerHTML = `<a href="javascript:void(0)" id="${lastid}">Multiaccount Finder</a>`;
                                    linksList.appendChild(multiaccountFinderItem);
                                    let usernameLink = postElement.querySelector('a');
                                    let currentUrl = usernameLink.getAttribute('href')
                                    //console.log(postElement)
                                    let multiaccountFinderButton = document.getElementById(lastid);
                                    if (multiaccountFinderButton) {
                                        multiaccountFinderButton.addEventListener("click", function (event) {
                                            event.preventDefault();
                                            checkUser(`https://${domain}/${currentUrl}shared-ips/`)
                                        })
                                    }
                                }
                                //console.log("Текущая страница начинается с https://zelenka.guru/threads/");

                            }
                        }
                    }
                }
            });
        });
    }
}

setInterval(checkMenuItems);
setInterval(checkThreadItems);

function xenforoLogAndAlert(text, title) {
    console.log(text)
    XenForo.alert(`${text}`, `${title}`)
}

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

        const totalUsers = bannedUsersCount + nonBannedUsersCount;
        const bannedPercent = totalUsers ? ((bannedUsersCount / totalUsers) * 100).toFixed(2) : 0;
        const nonBannedPercent = totalUsers ? ((nonBannedUsersCount / totalUsers) * 100).toFixed(2) : 0;

        const scammer = `${name} - мошенник\n% заблокированных: ${bannedPercent}\n% не заблокированных: ${nonBannedPercent}\nОбщее количество пользователей в общих IP: ${numUserLogs}`
        const mbscammer = `${name} - возможно мошенник\n% заблокированных: ${bannedPercent}\n% не заблокированных: ${nonBannedPercent}\nОбщее количество пользователей в общих IP: ${numUserLogs}`
        const vpn = `${name} - использует VPN\n% заблокированных: ${bannedPercent}\n% не заблокированных: ${nonBannedPercent}\nОбщее количество пользователей в общих IP: ${numUserLogs}`
        const mbvpn = `${name} - возможно использует VPN\n% заблокированных: ${bannedPercent}\n% не заблокированных: ${nonBannedPercent}\nОбщее количество пользователей в общих IP: ${numUserLogs}`
        const cleaned = `${name} - пользователи по заданным параметрам не найдены`
        const multiaccount = `${name} - мультиаккаунт\n% заблокированных: ${bannedPercent}\n% не заблокированных: ${nonBannedPercent}\nОбщее количество пользователей в общих IP: ${numUserLogs}`

        const template = `https://${domain}/forums/801/create-thread?title=%D0%96%D0%B0%D0%BB%D0%BE%D0%B1%D0%B0+%D0%BD%D0%B0+%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8F+${name}&message=1.+%D0%9D%D0%B8%D0%BA%D0%BD%D0%B5%D0%B9%D0%BC+%D0%BD%D0%B0%D1%80%D1%83%D1%88%D0%B8%D1%82%D0%B5%D0%BB%D1%8F+%D0%B8+%D1%81%D1%81%D1%8B%D0%BB%D0%BA%D0%B0+%D0%BD%D0%B0+%D0%BF%D1%80%D0%BE%D1%84%D0%B8%D0%BB%D1%8C%3A+${link.replace(`/shared-ips`, ``)}%2F%0A2.+%D0%9A%D1%80%D0%B0%D1%82%D0%BA%D0%BE%D0%B5+%D0%BE%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5+%D0%B6%D0%B0%D0%BB%D0%BE%D0%B1%D1%8B%3A%0A3.+%D0%94%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D1%81%D1%82%D0%B2%D0%B0%3A`;

        if (htmlDocument.body.textContent.includes("Пользователей по заданным параметрам не найдено.") ||
            htmlDocument.body.textContent.includes("No matching users were found.")) {
            gifElement && (gifElement.src = 'https://i.imgur.com/i4OlWJk.png');
            gifElement && (gifElement.title = `${cleaned}`);
            !gifElement && xenforoLogAndAlert(`${cleaned}`, `Lolzteam Multiaccount Finder`);

        } else if (bannedUsersCount >= nonBannedUsersCount && bannedUsersCount !== 0) {
            if (gifElement) {
                gifElement.addEventListener('click', function() {
                    // при нажатии на красный треугольник доступ к быстрому созданию темы
                    window.location.href = `${template}`
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
                    window.location.href = `${template}` // редирект на создание жалобы Zelenka.guru
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
