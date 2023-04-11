// ==UserScript==
// @name         Lolzteam Multiaccount Finder
// @version      1.6.1
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
    {key: "addbutton-conversations", value: "true"},
    {key: "retry-after-error", value: "true"},
    {key: "fast-switch-with-button", value: "false"},
    {key: "fast-switch-with-button-key", value: "F2"},
    {key: "switch-page-automatically", value: "false"}
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
const month = months[date.getMonth()];

// ***вроде оптимизирован более-менее***
function openSettings(page = 1) {
    let modal = document.querySelector('div.modal.fade');
    if (modal && modal.querySelector('[id^="addbutton-"]')) {
        modal.remove();
    }

    document.querySelectorAll('div.modal-backdrop.fade').forEach(modalBackdrop => modalBackdrop.remove());
    const lastId = generateRandomString(10);

    let checkboxes = [
        { id: 'autocheck-profile', label: 'Автоматическая проверка в профиле' },
        { id: 'autocheck-mini-profile', label: 'Автоматическая проверка в мини-профиле' },
        { id: 'autocheck-banned-users-mporp', label: 'Автоматическая проверка для заблокированных', dependent: ['autocheck-profile', 'autocheck-mini-profile'] },
        { id: 'autocheck-newmembers', label: 'Автоматическая проверка новых пользователей в разделе /members' },
        { id: 'autocheck-online-registered', label: 'Автоматическая проверка в разделе /online/?type=registered' },
        { id: 'autocheck-only-parameters', label: `Автоматическая проверка только по параметрам (<span id="sympCount-${lastId}">${localStorage.getItem('autocheck-only-parameters-sympathies')}</span> симпатий и <span id="msgCount-${lastId}">${localStorage.getItem('autocheck-only-parameters-messages')}</span> сообщений)` },
        { id: 'addbutton-threads', label: 'Кнопка на посты и комментарии в теме (три точки)' },
        { id: 'addbutton-chat', label: 'Кнопка на сообщения в чате (три точки)' },
        { id: 'addbutton-profile', label: 'Кнопка на посты и комментарии в профиле (три точки)' },
        { id: 'addbutton-alerts', label: 'Кнопка на уведомления (три точки)' },
        { id: 'addbutton-conversations', label: 'Кнопка на диалоги в личных сообщения (три точки)' },
        { id: 'show-blocked-percentage', label: 'Отображать в подробной информации % заблокированных' },
        { id: 'show-unblocked-percentage', label: 'Отображать в подробной информации % не заблокированных' },
        { id: 'show-total-users-ip', label: 'Отображать в подробной информации общее количество пользователей в общих IP' },
        { id: 'show-blocked-this-month-percentage', label: 'Отображать в подробной информации % от заблокированных в этом месяце' },
        { id: 'fast-switch-with-button', label: `Быстрое переключение на следующую страницу кнопкой <span id="buttonkey-${lastId}">${localStorage.getItem('fast-switch-with-button-key')}</span>` },
        { id: 'retry-after-error', label: 'Повторная проверка после ошибки Name not found (15000 ms)' },
        { id: 'switch-page-automatically', label: 'Переключать на следующую страницу автоматически (пока не найдет мошенника)' }
    ]

    const numCheckboxes = checkboxes.length;
    const checkboxesPerPage = 10;
    const numPages = Math.ceil(numCheckboxes / checkboxesPerPage);

    const startIndex = (page - 1) * checkboxesPerPage;
    const endIndex = page * checkboxesPerPage;
    let filteredCheckboxes = checkboxes.slice(startIndex, endIndex);
    let nextPage = page + 1;
    let prevPage = page - 1;

    if (page > 1) {
        filteredCheckboxes = checkboxes.slice((page - 1) * checkboxesPerPage, page * checkboxesPerPage);
        nextPage = page + 1;
    } else {
        filteredCheckboxes = checkboxes.slice(0, checkboxesPerPage);
    }

    let content = "";

    filteredCheckboxes.forEach(function(checkbox, index) {
        let isChecked = localStorage.getItem(checkbox.id) === "true";
        const disabled = checkbox.dependent && !checkbox.dependent.every(function (dep) {
            return localStorage.getItem(dep) === "true";
        });
        content += '<div> <input type="checkbox" id="' + checkbox.id + '-' + lastId + '" name="' + checkbox.id + '-' + lastId + '" ' + (isChecked ? 'checked="checked" ' : '') + (disabled ? 'disabled ' : '') + 'value="1"> ' + checkbox.label + '</div>';
        if (index !== filteredCheckboxes.length - 1) {
            content += '<br>';
        }
    });

    // Добавляем "Предыдущая страница" кнопку
    if (prevPage >= 1) {
        content += '<br>';
        content += (nextPage <= numPages) ?
            '<div style="margin-right: 10px; display: inline-block;"><button type="button" name="prev" value="Предыдущая страница" accesskey="s" class="button primary" id="prev-page-' + lastId + '">Предыдущая страница</button></div>' :
        '<button type="button" name="prev" value="Предыдущая страница" accesskey="s" class="button primary" id="prev-page-' + lastId + '">Предыдущая страница</button>';
    }

    // Добавляем "Следующая страница" кнопку
    if (nextPage <= numPages) {
        content += (prevPage >= 1) ?
            '<button type="button" name="next" value="Следующая страница" accesskey="s" class="button primary" id="next-page-' + lastId + '">Следующая страница</button>' :
        '<br><button type="button" name="next" value="Следующая страница" accesskey="s" class="button primary" id="next-page-' + lastId + '">Следующая страница</button>';
    }

    // Добавляем текст на какой странице настроек пользователь находится
    content += '<span style="margin-left: 10px;">Страница: ' + page + ' из ' + numPages + '</span>';

    XenForo.alert(content, 'Lolzteam Multiaccount Finder');

    filteredCheckboxes.forEach(function(checkbox) {
        const id = checkbox.id + '-' + lastId;
        const checkboxEl = document.getElementById(id);
        if (checkboxEl) {
            checkboxEl.addEventListener('change', function() {
                localStorage.setItem(checkbox.id, `${this.checked}`);
            });
        }
    });

    const addClickListener = (selector, promptMessage, localStorageKey) => {
        const el = document.querySelector(selector);
        if (el) {
            el.addEventListener('click', function() {
                const newValue = prompt(promptMessage);
                if (newValue !== null && !isNaN(parseInt(newValue)) && newValue.trim() !== '') {
                    localStorage.setItem(localStorageKey, newValue);
                    el.textContent = newValue;
                }
            });
        }
    };

    addClickListener(`#sympCount-${lastId}`, "Введите новое значение счетчика симпатий:", "autocheck-only-parameters-sympathies");
    addClickListener(`#msgCount-${lastId}`, "Введите новое значение счетчика сообщений:", "autocheck-only-parameters-messages");

    const addPageClickListener = (selector, page) => {
        const el = document.querySelector(selector);
        if (el) {
            el.addEventListener('click', function(event) {
                event.stopPropagation();
                openSettings(page);
            });
        }
    };

    ['next', 'prev'].forEach((direction) => {
        addPageClickListener(`#${direction}-page-${lastId}`, direction === 'next' ? nextPage : prevPage);
    });

    const buttonKey = document.querySelector(`#buttonkey-${lastId}`);
    if (buttonKey) {
        let keydownListener; // Объявляем переменную для хранения ссылки на функцию-слушатель
        buttonKey.addEventListener('click', () => {
            buttonKey.style.color = 'red'; // Изменяем цвет текста на красный
            const toggleKeydownListener = () => {
                if (keydownListener) {
                    document.removeEventListener('keydown', keydownListener);
                    buttonKey.style.color = ''; // Возвращаем обычный цвет текста кнопки
                    keydownListener = null; // Устанавливаем значение переменной keydownListener в null
                } else {
                    const currentKey = localStorage.getItem('fast-switch-with-button-key');
                    keydownListener = (event) => {
                        if (event.key !== currentKey) { // Если нажата другая клавиша, сохраняем ее в Local Storage и обновляем текст метки
                            localStorage.setItem('fast-switch-with-button-key', event.key);
                            buttonKey.textContent = `${event.key}`;
                            buttonKey.style.color = ''; // Возвращаем обычный цвет текста кнопки
                            document.removeEventListener('keydown', keydownListener); // Удаляем слушатель событий keydown
                            keydownListener = null; // Устанавливаем значение переменной keydownListener в null
                        }
                    };
                    document.addEventListener('keydown', keydownListener); // Добавляем слушатель событий keydown
                }
            };
            toggleKeydownListener();
        });
    }
}

// ***уже оптимизирован***
// Добавляем кнопку Multiaccount Finder в профиле и мини профиле если присутствует кнопка shared-ips
function checkMenuItems() {
    const sharedItems = document.querySelectorAll('.Menu a[href*="/shared-ips"]');
    sharedItems.forEach(item => {
        const menu = item.parentNode.parentNode;
        if (menu.hasAttribute("data-multiaccount-finder")) return;
        menu.setAttribute("data-multiaccount-finder", "added");
        const buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
        //newMenuItem.innerHTML = `<a href="javascript:void(0)" id="${buttonId}">Multiaccount Finder</a>`;
        const currentUrl = item.getAttribute('href');
        menu.appendChild(createButtonElement(buttonId, currentUrl));


        const makeClaimLink = menu.querySelector('a[href*="/make-claim"]');
        if (makeClaimLink) {
            if (localStorage.getItem("autocheck-mini-profile") !== 'true') return;
            //console.log(makeClaimLink.parentNode.parentNode)
            const bannedModule = document.querySelectorAll('.usernameAndStatus');
            bannedModule.forEach(module => {
                const bannedcheck = module.parentNode.parentNode;
                if (bannedcheck.hasAttribute("data-multiaccount-finder")) return;
                bannedcheck.setAttribute("data-multiaccount-finder", "added");
                const gifId = `gif-profile-${generateRandomString(10)}`;

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

                lastElement.appendChild(createGifElement(gifId, 'https://i.imgur.com/I5VH0zp.gif', 24,24));
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

                const gifId = `gif-profile`;

                const countsModule = document.querySelectorAll('.counts_module');
                countsModule.forEach(module => {
                    const profilecounter = module.parentNode.parentNode;
                    if (profilecounter.hasAttribute("data-multiaccount-finder")) return;
                    profilecounter.setAttribute("data-multiaccount-finder", "added");
                    if (sympathies || !messages) {
                        if (localStorage.getItem("autocheck-only-parameters") === 'true' && (sympathies >= parseInt(localStorage.getItem("autocheck-only-parameters-sympathies")) && messages >= parseInt(localStorage.getItem("autocheck-only-parameters-messages")))) return;
                    }
                    module.appendChild(createGifElement(gifId, 'https://i.imgur.com/I5VH0zp.gif', 32,32));
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

function createButtonElement(buttonId, currentUrl) {
    const multiaccountFinderItem = document.createElement("li");
    const button = document.createElement("a");
    button.setAttribute("href", "javascript:void(0)");
    button.setAttribute("id", buttonId);
    button.textContent = "Multiaccount Finder";
    button.addEventListener("click", function(event) {
        event.preventDefault();
        checkUser(`https://${domain}/${currentUrl}/shared-ips/`).then();
    });
    multiaccountFinderItem.appendChild(button);
    return multiaccountFinderItem;
}

function createGifElement(gifId, src, width, height) {
    const gifElement = document.createElement('img');
    gifElement.id = gifId;
    gifElement.src = src;
    gifElement.width = width;
    gifElement.height = height;
    return gifElement;
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
                            const buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;

                            const usernameLink = postElement.querySelector('a');
                            const currentUrl = usernameLink.getAttribute('href');

                            menus[menus.length - 1].querySelector('.secondaryContent').appendChild(createButtonElement(buttonId, currentUrl));
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
                            document.createElement("li");
                            let buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
                            let currentUrl = author.getAttribute('href')
                            menus[menus.length - 1].querySelector('.secondaryContent').appendChild(createButtonElement(buttonId, currentUrl));

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
                    lastMenu.querySelector('ul.secondaryContent.blockLinksList').appendChild(createButtonElement(buttonId, usernameLink));
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
            document.createElement("li");
            let buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
            targetElement.querySelector('.blockLinksList').appendChild(createButtonElement(buttonId, usernameLink));
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
            }
            const ulElement = lastElement.querySelector('ul.secondaryContent.blockLinksList');
            if (!ulElement || ulElement.hasAttribute("data-multiaccount-finder")) return;

            ulElement.setAttribute("data-multiaccount-finder", "added");
            const username = usernameLink.textContent
            const buttonId = `multiaccountFinderButton-${generateRandomString(10)}`;
            if (username !== hrefSearchUsers) {
                ulElement.appendChild(createButtonElement(buttonId, usernameLink.href.replace(`https://${domain}`, '')));
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
            if (findelement.classList.contains('scammers')) {
                ddElement.style.color = 'red';
            }
        }
    }
    const shouldDecrementRemainedElement = !(classname === 'dl.errors' && localStorage.getItem('retry-after-error') === 'true');
    if (remainedElement && shouldDecrementRemainedElement) {
        const currentValueRemained = parseInt(remainedElement.textContent);
        remainedElement.textContent = currentValueRemained - 1;
    }
}

// Проверяем, начинается ли текущий URL с "https://${domain}/online/?type=registered/"
if (localStorage.getItem("autocheck-online-registered") === 'true') {
    if (window.location.href.indexOf(`https://${domain}/online/?type=registered`) === 0) {
        const currentPage = parseInt(document.querySelector('.currentPage').innerText.trim());
        const maxPage = parseInt(document.querySelector("#content > div > div > div > div > div > div > nav > a:nth-child(5)").innerText.trim());

        if (localStorage.getItem("fast-switch-with-button") === 'true') {
            document.addEventListener('keydown', function(event) {
                if (event.keyCode === 113 && currentPage < maxPage) {
                    window.location.href = `https://${domain}/online/?type=registered&page=${currentPage + 1}`;
                }
            });
        }

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
            if (index >= members.length) {
                const scammersCount = parseInt(document.querySelector("dl.scammers dd").innerText);
                if (localStorage.getItem("switch-page-automatically") === 'true' && currentPage < maxPage && scammersCount < 1) {
                    window.location.href = `https://${domain}/online/?type=registered&page=${currentPage + 1}`;
                }
                return;
            }

            const member = members[index];
            const usernameLink = member.querySelector('a.username');
            const usernameHref = usernameLink.getAttribute('href');
            const userStatCounters = member.querySelector('.userStatCounters');

            const gifId = `gif-${index}`;

            if (usernameLink.textContent !== hrefSearchUsers) {
                const sympathies = member.querySelector("div.userStatCounters > div:nth-child(1) > span.count").textContent.replace(/ /g, "")
                const messages = member.querySelector("div.userStatCounters > div:nth-child(2) > span.count").textContent.replace(/ /g, "")

                if (localStorage.getItem("autocheck-only-parameters") === "true") {
                    if ((sympathies < parseInt(localStorage.getItem("autocheck-only-parameters-sympathies")) && messages < parseInt(localStorage.getItem("autocheck-only-parameters-messages")))
                        || (sympathies >= parseInt(localStorage.getItem("autocheck-only-parameters-sympathies")) && messages < parseInt(localStorage.getItem("autocheck-only-parameters-messages")))
                        || (sympathies < parseInt(localStorage.getItem("autocheck-only-parameters-sympathies")) && messages >= parseInt(localStorage.getItem("autocheck-only-parameters-messages")))) {
                        userStatCounters.appendChild(createGifElement(gifId, 'https://i.imgur.com/I5VH0zp.gif', 24,24));
                        await checkUser(`https://${domain}/${usernameHref}shared-ips`, 'registered', gifId);
                    } else {
                        OnlineChangeTable('dl.skipped', 1)
                    }
                } else {
                    userStatCounters.appendChild(createGifElement(gifId, 'https://i.imgur.com/I5VH0zp.gif', 24,24));
                    await checkUser(`https://${domain}/${usernameHref}shared-ips`, 'registered', gifId);
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
        const gifId = `gif-${index}`;
        userStatCounters.appendChild(createGifElement(gifId, 'https://i.imgur.com/I5VH0zp.gif', 24,24));
        await checkUser(`https://${domain}/${usernameHref}shared-ips`, 'members', gifId);
        index++;
        await checkNextMember();
    }
    checkNextMember().then()
}

function xenforoLogAndAlert(text, title) {
    console.log(text)
    XenForo.alert(`${text}`, `${title}`)
}

function encodeOutput(output) {
    const text = output.toString();
    return encodeURIComponent(text).replace("\n", "/%0A/g");
}

// ***уже оптимизирован***
function checkUser(link, source, gifId) {
    console.log(gifId)
    console.log(`${link.replace(/(https:\/\/.*?)\/\//g, '$1/').replace(/\/shared-ips/gi, "/shared-ips").replace(/(\/shared-ips)+/gi, "/shared-ips")}`)
    return fetch(`${link.replace(/(https:\/\/.*?)\/\//g, '$1/').replace(/\/shared-ips/gi, "/shared-ips").replace(/(\/shared-ips)+/gi, "/shared-ips")}`)
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
            OnlineChangeTable('dl.errors', 1);

            // Задержка в 15 секунд и повторная проверка

            if (localStorage.getItem('retry-after-error') === "true") {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        console.log("Retrying check for user:", link);
                        resolve(checkUser(link, source, gifId));
                    }, 15000);
                });
            } else {
                throw new Error("Name not found");
            }
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
            let title = encodeOutput(`Жалоба на пользователя ${name}`)
            let message = encodeOutput(`[CLUB]1. Никнейм нарушителя и ссылка на профиль: ${link.replace(`/shared-ips`,``)}/\n2. Краткое описание жалобы: ${description}\n3. Доказательства: ${link.replace(`/shared-ips`,``)}/shared-ips[/CLUB]`)
            const template = `https://${domain}/forums/801/create-thread?prefix_id=92&title=${title}&message=${message}`;
            window.open(`${template}`, '_blank');
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
        if (gifElement && output.includes("мошенник")) {
            gifElement.addEventListener('click', function () {
                // при нажатии на красный треугольник доступ к быстрому созданию темы
                template(output);
            });
        }
    })
        .catch(error => console.error(error));
}
