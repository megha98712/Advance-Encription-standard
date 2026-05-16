// Simple login
function login() {

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user && pass) {

        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('aesPage').style.display = 'block';

    } else {

        alert('Enter username and password!');
    }
}

// Star animation
const starCanvas = document.getElementById('starCanvas');
const sctx = starCanvas.getContext('2d');

let sw = starCanvas.width = window.innerWidth;
let sh = starCanvas.height = window.innerHeight;

const stars = [];

for (let i = 0; i < 150; i++) {

    stars.push({
        x: Math.random() * sw,
        y: Math.random() * sh,
        r: Math.random() * 2 + 1,
        d: Math.random() * 0.5 + 0.1,
        twinkle: Math.random() * 2 * Math.PI
    });
}

function drawStars() {

    sctx.clearRect(0, 0, sw, sh);

    stars.forEach(star => {

        star.twinkle += 0.05;

        const alpha = 0.5 + 0.5 * Math.sin(star.twinkle);

        sctx.beginPath();

        sctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);

        sctx.fillStyle = `rgba(255,255,255,${alpha})`;

        sctx.fill();

        star.y -= star.d;

        if (star.y < -5) {

            star.y = sh + 5;
            star.x = Math.random() * sw;
        }
    });

    requestAnimationFrame(drawStars);
}

drawStars();

window.addEventListener('resize', () => {

    sw = starCanvas.width = window.innerWidth;
    sh = starCanvas.height = window.innerHeight;
});

// AES functionality
let historyArr = [];

async function getAESKey(keyStr, keySize) {

    const enc = new TextEncoder();

    let sizeBytes = keySize / 8;

    let keyBytes = enc.encode(
        keyStr.padEnd(sizeBytes, '0').slice(0, sizeBytes)
    );

    return crypto.subtle.importKey(
        'raw',
        keyBytes,
        'AES-CBC',
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptAES() {

    const text = document.getElementById('inputText').value;

    const keyStr = document.getElementById('keyInput').value;

    const keySize = parseInt(
        document.getElementById('keySizeSelect').value
    );

    if (!text || !keyStr) {

        alert('Enter text and key!');
        return;
    }

    const key = await getAESKey(keyStr, keySize);

    const iv = crypto.getRandomValues(new Uint8Array(16));

    const enc = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv },
        key,
        enc.encode(text)
    );

    const buffer = new Uint8Array(encrypted);

    const cipherText = btoa(
        String.fromCharCode(...iv) +
        String.fromCharCode(...buffer)
    );

    document.getElementById('outputText').innerText =
        "Ciphertext: " + cipherText;

    document.getElementById('inputText').value = cipherText;

    addHistory(`Encrypted: ${cipherText}`);
}

async function decryptAES() {

    const cipher = document.getElementById('inputText').value;

    const keyStr = document.getElementById('keyInput').value;

    const keySize = parseInt(
        document.getElementById('keySizeSelect').value
    );

    if (!cipher || !keyStr) {

        alert('Enter ciphertext and key!');
        return;
    }

    try {

        const combined = atob(cipher);

        const iv = new Uint8Array(
            [...combined.slice(0, 16)].map(c => c.charCodeAt(0))
        );

        const data = new Uint8Array(
            [...combined.slice(16)].map(c => c.charCodeAt(0))
        );

        const key = await getAESKey(keyStr, keySize);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-CBC', iv },
            key,
            data
        );

        const decStr = new TextDecoder().decode(decrypted);

        document.getElementById('outputText').innerText =
            "Decrypted: " + decStr;

        document.getElementById('inputText').value = decStr;

        addHistory(`Decrypted: ${decStr}`);

    } catch (e) {

        alert('Decryption failed!');
    }
}

function clearText() {

    document.getElementById('inputText').value = "";

    document.getElementById('outputText').innerText = "";
}

function copyText() {

    navigator.clipboard.writeText(
        document.getElementById('outputText').innerText.replace(
            /^Ciphertext: |^Decrypted: /,
            ''
        )
    );

    alert("Copied!");
}

function addHistory(text) {

    historyArr.unshift(text);

    if (historyArr.length > 5) {

        historyArr.pop();
    }

    document.getElementById('history').innerHTML =
        "<strong>History:</strong><br>" +
        historyArr.join('<br>');
}

function copyHistory() {

    navigator.clipboard.writeText(historyArr.join('\n'));

    alert("History copied!");
}