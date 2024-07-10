let quests = [];
let showCompleted = false;  // showCompleted 変数の定義

function fetchQuests() {
    return fetch('quests.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            quests = data;
            renderQuestTable();
            updateItemList();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// クエストテーブルのレンダリングとアイテムリストの更新を初期化するためにfetchQuestsを呼び出します。
fetchQuests();

function renderQuestTable() {
    const questTableBody = document.querySelector('#questTable tbody');
    questTableBody.innerHTML = '';

    quests.forEach((quest, index) => {
        const row = document.createElement('tr');
        row.dataset.index = index;

        const compCell = document.createElement('td');
        const compCheckbox = document.createElement('input');
        compCheckbox.type = 'checkbox';
        const isCompleted = getLocalStorage(`quest_comp_${index}`) !== null ? getLocalStorage(`quest_comp_${index}`) : quest.comp;
        compCheckbox.checked = isCompleted;
        compCheckbox.addEventListener('change', () => {
            setLocalStorage(`quest_comp_${index}`, compCheckbox.checked);
            updateItemList();
            renderQuestTable();
        });
        compCell.appendChild(compCheckbox);
        row.appendChild(compCell);

        Object.keys(quest).forEach(key => {
            if (key !== 'comp') {
                const cell = document.createElement('td');
                cell.textContent = quest[key];
                if (quest[key] === 'NaN' || quest[key] === 0) {
                    cell.textContent = '';
                    cell.classList.add('empty-cell');
                }
                row.appendChild(cell);
            }
        });

        if (isCompleted) {
            if (showCompleted) {
                row.classList.add('completed');
            } else {
                row.classList.add('hidden');
            }
        }

        questTableBody.appendChild(row);
    });
}

function updateItemList() {
    const itemList = {};

    quests.forEach((quest, index) => {
        if (!getLocalStorage(`quest_comp_${index}`)) {
            for (let i = 1; i <= 4; i++) {
                const itemKey = `item${i}`;
                const reqKey = `req${i}`;
                if (quest[itemKey] !== 'NaN' && quest[reqKey] > 0) {
                    if (!itemList[quest[itemKey]]) {
                        itemList[quest[itemKey]] = 0;
                    }
                    itemList[quest[itemKey]] += quest[reqKey];
                }
            }
        }
    });

    renderItemListTable(itemList);
}

function renderItemListTable(itemList) {
    const itemListTableBody = document.querySelector('#itemListTable tbody');
    itemListTableBody.innerHTML = '';

    Object.keys(itemList).forEach(item => {
        const row = document.createElement('tr');

        const itemCell = document.createElement('td');
        itemCell.textContent = item;
        row.appendChild(itemCell);

        const reqCell = document.createElement('td');
        reqCell.textContent = itemList[item];
        row.appendChild(reqCell);

        const possCell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.classList.add('input-number');
        input.value = getLocalStorage(`item_poss_${item}`) || 0;
        input.addEventListener('input', () => {
            setLocalStorage(`item_poss_${item}`, input.value);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container-inline');

        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.addEventListener('click', () => {
            input.value = parseInt(input.value) + 1;
            setLocalStorage(`item_poss_${item}`, input.value);
        });

        const subtractButton = document.createElement('button');
        subtractButton.textContent = '-';
        subtractButton.addEventListener('click', () => {
            input.value = Math.max(0, parseInt(input.value) - 1);
            setLocalStorage(`item_poss_${item}`, input.value);
        });

        const clearButton = document.createElement('button');
        clearButton.textContent = 'clear';
        clearButton.addEventListener('click', () => {
            input.value = 0;
            setLocalStorage(`item_poss_${item}`, input.value);
        });

        buttonContainer.appendChild(input);
        buttonContainer.appendChild(addButton);
        buttonContainer.appendChild(subtractButton);
        buttonContainer.appendChild(clearButton);

        possCell.appendChild(buttonContainer);
        row.appendChild(possCell);

        itemListTableBody.appendChild(row);
    });
}

function toggleCompleted() {
    showCompleted = !showCompleted;
    const toggleButton = document.getElementById('toggleCompletedButton');
    toggleButton.textContent = showCompleted ? '完了済みのクエストを非表示' : '完了済みのクエストを表示';
    renderQuestTable();
}

function sortTable(tableId, colIndex) {
    const table = document.getElementById(tableId);
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);

    rows.sort((a, b) => {
        const aText = a.cells[colIndex].textContent.trim();
        const bText = b.cells[colIndex].textContent.trim();

        return aText.localeCompare(bText, 'ja');
    });

    rows.forEach(row => tbody.appendChild(row));
}

function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

let exploreQuests = [];
let showAccepted = false;
let mapFilter = '';

function fetchExploreQuests() {
    return fetch('explore_quests.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            exploreQuests = data;
            renderExploreQuestTable();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function renderExploreQuestTable() {
    const exploreQuestTableBody = document.querySelector('#exploreQuestTable tbody');
    exploreQuestTableBody.innerHTML = '';

    exploreQuests.forEach((quest, index) => {
        const isAccepted = getLocalStorage(`explore_quest_accepted_${index}`) !== null ? getLocalStorage(`explore_quest_accepted_${index}`) : quest['受注'];
        if (showAccepted && !isAccepted) return;
        if (mapFilter && quest['MAP'] !== mapFilter) return;

        const row = document.createElement('tr');
        row.dataset.index = index;

        const acceptedCell = document.createElement('td');
        const acceptedCheckbox = document.createElement('input');
        acceptedCheckbox.type = 'checkbox';
        acceptedCheckbox.checked = isAccepted;
        acceptedCheckbox.addEventListener('change', () => {
            setLocalStorage(`explore_quest_accepted_${index}`, acceptedCheckbox.checked);
            renderExploreQuestTable();
        });
        acceptedCell.appendChild(acceptedCheckbox);
        row.appendChild(acceptedCell);

        ['依頼主', 'クエスト', 'MAP', '種別', '階層', 'エリア', '座標(x,y)', '回数'].forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = quest[key];
            row.appendChild(cell);
        });

        exploreQuestTableBody.appendChild(row);
    });
}

function toggleAccepted() {
    showAccepted = !showAccepted;
    const toggleButton = document.getElementById('toggleAcceptedButton');
    toggleButton.textContent = showAccepted ? '受注済みのクエストを非表示' : '受注済みのクエストを表示';
    renderExploreQuestTable();
}

function filterByMap(map) {
    mapFilter = map;
    renderExploreQuestTable();
}

function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// 初期化
fetchExploreQuests();
