const drop1 = document.getElementById('drop1');
const drop2 = document.getElementById('drop2');
const input1 = document.getElementById('file1');
const input2 = document.getElementById('file2');
const loadingEl = document.getElementById('loading');
let file1 = null, file2 = null;

function setupDrop(dropEl, inputEl, setFile) {
    dropEl.addEventListener('click', () => inputEl.click());
    dropEl.addEventListener('dragover', e => {
    e.preventDefault();
    dropEl.classList.add('dragover');
    });
    dropEl.addEventListener('dragleave', () => dropEl.classList.remove('dragover'));
    dropEl.addEventListener('drop', e => {
    e.preventDefault();
    dropEl.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
        setFile(file);
        dropEl.innerHTML = `✅ <strong>${file.name}</strong>`;
    }
    });
    inputEl.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
        setFile(file);
        dropEl.innerHTML = `✅ <strong>${file.name}</strong>`;
    }
    });
}

setupDrop(drop1, input1, f => file1 = f);
setupDrop(drop2, input2, f => file2 = f);

function formatBytes(bytes) {
    return {
    bytes: bytes.toLocaleString(),
    kb: (bytes / 1024).toFixed(3),
    mb: (bytes / 1024 / 1024).toFixed(6)
    };
}

async function getHash(file, algorithm) {
    const buffer = await file.arrayBuffer();
    const hash = await crypto.subtle.digest(algorithm, buffer);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function compareFiles() {
    const resultEl = document.getElementById('result');
    const hashEl = document.getElementById('hashes');
    const sizeEl = document.getElementById('size-info');
    loadingEl.textContent = '🔄 비교하고 있어요...';
    loadingEl.className = 'toast loading show';
    resultEl.textContent = '';
    resultEl.className = 'result';
    resultEl.classList.remove('show');
    hashEl.textContent = '';
    sizeEl.textContent = '';
    sizeEl.style.display = 'none';
    hashEl.style.display = 'none';

    if (!file1 || !file2) {
    loadingEl.textContent = '';
    loadingEl.className = '';
    resultEl.textContent = '⚠️ 두 파일을 모두 선택해주세요.';
    resultEl.className = 'toast';
    return;
    }

    const [sha256_1, sha256_2] = await Promise.all([getHash(file1, 'SHA-256'), getHash(file2, 'SHA-256')]);
    const [sha1_1, sha1_2]     = await Promise.all([getHash(file1, 'SHA-1'), getHash(file2, 'SHA-1')]);
    const [md5_1, md5_2]       = await Promise.all([getHash(file1, 'MD5'), getHash(file2, 'MD5')]).catch(() => [null, null]);

    resultEl.textContent = sha256_1 === sha256_2
    ? '✅ 네, 같은 파일이네요!'
    : '❌ 아니요, 다른 파일이네요.';
    resultEl.className = 'toast';
    resultEl.classList.add('show');

    const s1 = formatBytes(file1.size);
    const s2 = formatBytes(file2.size);
    sizeEl.innerHTML = 
    `<h2>📦 파일 크기 비교</h2>
    <div class="file-result">
        <div class="row">
            <strong>Bytes</strong>
            <div>
                <div>파일 1: ${s1.bytes}</div>
                <div>파일 2: ${s2.bytes}</div>
            </div>
        </div>
        <div class="row">
            <strong>KB</strong>
            <div>
                <div>파일 1: ${s1.kb}</div>
                <div>파일 2: ${s2.kb}</div>
            </div>
        </div>
        <div class="row">
            <strong>MB</strong>
            <div>
                <div>파일 1: ${s1.mb}</div>
                <div>파일 2: ${s2.mb}</div>
            </div>
        </div>
    </div>
    <hr>
    <div class="center-text">${file1.size === file2.size ? '✅ 파일 크기가 동일해요.' : '❌ 파일 크기가 달라요.'}</div>`;

    hashEl.innerHTML = 
    `<h2>🔐 해시 비교 결과</h2>
    <div class="col">
        <strong>SHA-256</strong>
        <div>
            <div>파일 1: ${sha256_1}</div>
            <div>파일 2: ${sha256_2}</div>
        </div>
    </div>
    <div class="col">
        <strong>SHA-1</strong>
        <div>
            <div>파일 1: ${sha1_1}</div>
            <div>파일 2: ${sha1_2}</div>
        </div>
    </div>
    <hr>
    ${md5_1 ? `<div class="row"><strong>MD5</strong><div>파일 1: ${md5_1}</div><div>파일 2: ${md5_2}</div></div>` : '<div class="center-text">⚠️ 브라우저에서 MD5를 지원하지 않는 것 같아요.</div>'}`;

    loadingEl.textContent = '';
    loadingEl.className = 'loading';
    document.getElementById('size-info').style.display = 'flex';
    document.getElementById('hashes').style.display = 'flex';
}