//tam hali
// Verileri işlemek ve ekranda göstermek için bir fonksiyon
function processAndDisplayData(data, decimalPlaces) {
    const with3Digits = {};
    const with5Digits = {};
    const with8Digits = {};

    data.forEach(entry => {
        if (entry.hesap_kodu) {
            const hesapKodu = entry.hesap_kodu;
            const borc = parseFloat(entry.borc) || 0;

            const parts = hesapKodu.split('.');

            if (parts.length >= 1) {
                with3Digits[parts[0]] = (with3Digits[parts[0]] || 0) + borc;
            }

            if (parts.length >= 2) {
                with5Digits[`${parts[0]}.${parts[1]}`] = (with5Digits[`${parts[0]}.${parts[1]}`] || 0) + borc;
            }

            if (parts.length >= 3) {
                with8Digits[hesapKodu] = (with8Digits[hesapKodu] || 0) + borc;
            }
        }
    });

    displayData(with3Digits, decimalPlaces, with5Digits,with8Digits);
}

// Ekrandaki verileri göstermek için bir fonksiyon
function displayData(with3Digits, decimalPlaces, with5Digits, with8Digits) {
    const dataBody = document.getElementById('data-body');
    dataBody.innerHTML = ''; // Tabloyu temizle

    // 5 haneli kodları ters sırala
    const sorted5Digits = {};
    Object.keys(with5Digits)
        .sort((a, b) => b.localeCompare(a))
        .forEach(key => {
            sorted5Digits[key] = with5Digits[key];
        });

    // 8 haneli kodları ters sırala
    const sorted8Digits = {};
    Object.keys(with8Digits)
        .sort((a, b) => b.localeCompare(a))
        .forEach(key => {
            sorted8Digits[key] = with8Digits[key];
        });

    for (const code in with3Digits) {
        const row = createRow(code, with3Digits[code].toFixed(decimalPlaces), true, sorted5Digits, sorted8Digits);
        dataBody.appendChild(row);
    }
}


function createRow(code, amount, isExpandable, withNextDigits, with8Digits) {
    const row = document.createElement('tr');
    const cell1 = document.createElement('td');
    const cell2 = document.createElement('td');
    const cell3 = document.createElement('td');

    if (isExpandable && code.length <7 ) {
        const button = document.createElement('button');
        button.textContent = '+';
        button.addEventListener('click', () => toggleExpand(code, button, withNextDigits, with8Digits));
        cell1.appendChild(button);
    }
    // if (isExpandable) {
    //     const button = document.createElement('button');
    //     button.textContent = '+';
    //     button.addEventListener('click', () => toggleExpand(code, button, withNextDigits, with8Digits));
    //     cell1.appendChild(button);
    // }

    cell2.textContent = code;
    cell3.textContent = amount;

    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);

    return row;
}

function toggleExpand(code, button, withNextDigits, with8Digits) {
    const dataBody = document.getElementById('data-body');
    const rows = dataBody.getElementsByTagName('tr');

    const insertionIndex = Array.from(rows).findIndex(row => row.querySelector('td:nth-child(2)').textContent === code);

    if (button.textContent === '+') {
        for (const key in withNextDigits) {
            if (key.startsWith(code)) {
                const row = createRow(key, withNextDigits[key].toFixed(2), true, with8Digits);
                row.setAttribute('data-parent', code);
                dataBody.insertBefore(row, rows[insertionIndex + 1]);
            }
        }
        button.textContent = '-';
    } else if (button.textContent === '-') {
        const rowsToRemove = dataBody.querySelectorAll(`tr[data-parent="${code}"]`);
        rowsToRemove.forEach(row => {
            row.remove();
        });
        button.textContent = '+';
    }
}


// Diğer fonksiyonları ve kodu olduğu gibi bırakabilirsiniz.

// İlgili bir jQuery eklentisi olan :contains seçicisini kullanmak için gerekli kod
jQuery.expr[':'].contains = function (a, i, m) {
    return jQuery(a).text().toUpperCase()
        .indexOf(m[3].toUpperCase()) >= 0;
};

// Verileri çek ve işle
// Sayfa yüklendiğinde çalışacak olan kod
document.addEventListener('DOMContentLoaded', async function () {
    const tokenResponse = await fetch('/get-token', {
        method: 'POST'
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.token) {
        const dataResponse = await fetch('/get-data', {
            method: 'POST'
        });

        const data = await dataResponse.json();

        if (data.error) {
            document.getElementById('result').textContent = `Veri alınamadı. Hata: ${data.error}`;
        } else {
            // Default olarak 2 ondalık basamak göster
            processAndDisplayData(data, 2);
        }
    } else {
        document.getElementById('result').textContent = `Token alınamadı. Hata: ${tokenData.error}`;
    }
});
