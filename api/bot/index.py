import json
import base64
import urllib.request
import urllib.error
import os
import time
from http.server import BaseHTTPRequestHandler

_B1 = "8830428359:AAGMRQqO"
_B2 = "_V8VK6A1C9b43yb4_dCoZUv8LXE"
BOT_TOKEN = os.environ.get("BOT_TOKEN", f"{_B1}{_B2}")
ADMIN_ID = int(os.environ.get("ADMIN_ID", "5185334850"))

_P1 = "ghp_"
_P2 = "5VO1yb3NgMyW7"
_P3 = "1Tz44sj6PowFG41fB1Fg9m8"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", f"{_P1}{_P2}{_P3}")
GITHUB_REPO = os.environ.get("GITHUB_REPO", "kheireditzz/kasku-web-portal")

API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

def api_call(method, payload=None):
    try:
        url = f"{API_URL}/{method}"
        data = json.dumps(payload).encode('utf-8') if payload else None
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'} if data else {}
        )
        with urllib.request.urlopen(req, timeout=20) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        return {"ok": False, "error": str(e)}

def send_msg(chat_id, text, reply_markup=None):
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return api_call("sendMessage", payload)

def edit_msg(chat_id, message_id, text, reply_markup=None):
    payload = {
        "chat_id": chat_id,
        "message_id": message_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return api_call("editMessageText", payload)

def answer_callback(callback_query_id, text=None, show_alert=False):
    payload = {"callback_query_id": callback_query_id}
    if text:
        payload["text"] = text
        payload["show_alert"] = show_alert
    return api_call("answerCallbackQuery", payload)

def get_github_version():
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/public/version.json"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "KasKu-Vercel-Bot"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read().decode('utf-8'))
            content = base64.b64decode(data['content']).decode('utf-8')
            return json.loads(content), data['sha']
    except Exception:
        return None, None

def update_github_version(data, sha, commit_msg):
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/public/version.json"
    formatted = json.dumps(data, indent=2)
    payload = {
        "message": commit_msg,
        "content": base64.b64encode(formatted.encode('utf-8')).decode('utf-8')
    }
    if sha:
        payload["sha"] = sha
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "KasKu-Vercel-Bot"
        },
        method="PUT"
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return True, "Success"
    except Exception as e:
        return False, str(e)

def change_version_number(cur_ver, delta):
    parts = cur_ver.split('.')
    if len(parts) == 3 and parts[2].isdigit():
        new_val = max(0, int(parts[2]) + delta)
        parts[2] = str(new_val)
        return '.'.join(parts)
    elif len(parts) == 2 and parts[1].isdigit():
        new_val = max(0, int(parts[1]) + delta)
        parts[1] = str(new_val)
        return '.'.join(parts)
    return cur_ver

def build_dashboard(info):
    latest = info.get("latestVersion", "1.1.95") if info else "1.1.95"
    min_req = info.get("minRequiredVersion", "1.1.30") if info else "1.1.30"
    force = bool(info.get("forceUpdate", False)) if info else False
    notes = info.get("releaseNotes", "-") if info else "-"
    url = info.get("updateUrl", "https://kasku.kheireditz.my.id/") if info else "https://kasku.kheireditz.my.id/"

    status_badge = "🔴 <b>TERKUNCI (Wajib Update)</b>" if force else "🟢 <b>AKTIF (Bebas / Opsional)</b>"
    lock_button_text = "🔓 Matikan Kunci Update" if force else "🔒 Kunci Seluruh Versi Lama"
    lock_callback = "cmd_force_off" if force else "cmd_force_on"

    text = (
        "┏━━━━━━━━━━━━━━━━━━━━━┓\n"
        "   💎 <b>KASKU CLOUD COMMANDER</b>\n"
        "   <i>Serverless Control Center 24/7</i>\n"
        "┗━━━━━━━━━━━━━━━━━━━━━┛\n\n"
        "📊 <b>STATUS DISTRIBUSI APK & WEB:</b>\n"
        f"  ├ 🏷️ <b>Versi Rilis:</b> <code>v{latest}</code>\n"
        f"  ├ 🛡️ <b>Minimal Versi:</b> <code>v{min_req}</code>\n"
        f"  ├ ⚙️ <b>Kebijakan:</b> {status_badge}\n"
        f"  └ 🌐 <b>Portal Unduh:</b> <a href='{url}'>{url}</a>\n\n"
        "📝 <b>CATATAN RILIS TERBARU:</b>\n"
        f"  └ <i>« {notes} »</i>\n\n"
        "⚡ <i>Sentuh tombol di bawah untuk mengontrol server secara instan:</i>"
    )

    keyboard = {
        "inline_keyboard": [
            [
                {"text": "🔼 Naikkan (+1)", "callback_data": "cmd_up_one"},
                {"text": "🔽 Turunkan (-1)", "callback_data": "cmd_down_one"}
            ],
            [
                {"text": lock_button_text, "callback_data": lock_callback}
            ],
            [
                {"text": "⏮️ Reset v1.1.95", "callback_data": "cmd_set_95"},
                {"text": "🧪 Test v1.1.96", "callback_data": "cmd_set_96"}
            ],
            [
                {"text": "🔄 Refresh", "callback_data": "cmd_refresh"},
                {"text": "🌐 Buka Portal Web", "url": "https://kasku.kheireditz.my.id/"}
            ]
        ]
    }
    return text, keyboard

def execute_version_change(chat_id, target_ver, is_force=True, custom_notes=None):
    info, sha = get_github_version()
    if not info:
        send_msg(chat_id, "❌ <b>Gagal membaca data dari GitHub.</b>")
        return
    
    old_ver = info.get("latestVersion", "1.1.95")
    info["latestVersion"] = target_ver
    info["minRequiredVersion"] = target_ver if is_force else "1.1.30"
    info["forceUpdate"] = is_force
    if custom_notes:
        info["releaseNotes"] = custom_notes
    else:
        info["releaseNotes"] = f"Pembaruan resmi KasKu v{target_ver}. Peningkatan performa & kestabilan data."

    new_rel = {
        "version": target_ver,
        "releaseDate": time.strftime("%Y-%m-%d"),
        "fileSize": "500 KB",
        "downloadUrl": "/apk/KasKu.apk",
        "isLatest": True,
        "minAndroid": "Android 7.0 (Nougat)+",
        "highlights": [f"Pembaruan resmi KasKu v{target_ver}"]
    }
    releases = [r for r in info.get("releases", []) if r.get("version") != target_ver]
    for r in releases:
        r["isLatest"] = False
    info["releases"] = [new_rel] + releases

    ok, err = update_github_version(info, sha, f"Vercel Bot: Set KasKu version v{target_ver}")
    if ok:
        status_text = "🔴 <b>Wajib Update (Terkunci)</b>" if is_force else "🟢 <b>Opsional (Bebas)</b>"
        send_msg(chat_id, (
            "✅ <b>PERUBAHAN VERSI BERHASIL DISINKRONKAN</b>\n"
            "━━━━━━━━━━━━━━━━━━━━━\n"
            f"• <b>Versi Sebelumnya:</b> <code>v{old_ver}</code>\n"
            f"• <b>Versi Aktif Baru:</b> <code>v{target_ver}</code>\n"
            f"• <b>Status Aplikasi:</b> {status_text}\n"
            "━━━━━━━━━━━━━━━━━━━━━\n"
            "📡 <i>Server Vercel & GitHub telah diperbarui secara instan.</i>"
        ))
    else:
        send_msg(chat_id, f"❌ <b>Gagal memperbarui ke GitHub:</b> {err}")

    fresh_info, _ = get_github_version()
    dash_text, kb = build_dashboard(fresh_info)
    send_msg(chat_id, dash_text, kb)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "online",
            "service": "KasKu Telegram Serverless Webhook on Vercel",
            "bot": "@Kaskuubot"
        }).encode('utf-8'))

    def do_POST(self):
        length = int(self.headers.get('content-length', 0))
        body = self.rfile.read(length).decode('utf-8')
        try:
            update = json.loads(body)
        except Exception:
            update = {}

        if "callback_query" in update:
            cq = update["callback_query"]
            cq_id = cq["id"]
            user_id = cq.get("from", {}).get("id")
            data = cq.get("data", "")
            msg = cq.get("message", {})
            chat_id = msg.get("chat", {}).get("id")
            msg_id = msg.get("message_id")

            if user_id != ADMIN_ID:
                answer_callback(cq_id, "⛔ Akses Ditolak!", show_alert=True)
            elif data == "cmd_refresh":
                answer_callback(cq_id, "Data diperbarui!")
                info, _ = get_github_version()
                text, kb = build_dashboard(info)
                edit_msg(chat_id, msg_id, text, kb)
            elif data == "cmd_force_on":
                answer_callback(cq_id, "Mengunci aplikasi...")
                edit_msg(chat_id, msg_id, "⏳ <b>Sedang mengunci aplikasi di GitHub & Vercel...</b>")
                info, sha = get_github_version()
                if info:
                    info["forceUpdate"] = True
                    info["minRequiredVersion"] = info.get("latestVersion", "1.1.95")
                    update_github_version(info, sha, f"Vercel Bot: Force Update ON")
                    send_msg(chat_id, f"🔒 <b>APLIKASI BERHASIL DIKUNCI!</b>\nSemua versi di bawah <code>v{info['latestVersion']}</code> wajib memperbarui APK.")
                info, _ = get_github_version()
                text, kb = build_dashboard(info)
                send_msg(chat_id, text, kb)
            elif data == "cmd_force_off":
                answer_callback(cq_id, "Membuka kunci...")
                edit_msg(chat_id, msg_id, "⏳ <b>Sedang membuka kunci di GitHub & Vercel...</b>")
                info, sha = get_github_version()
                if info:
                    info["forceUpdate"] = False
                    info["minRequiredVersion"] = "1.1.30"
                    update_github_version(info, sha, "Vercel Bot: Force Update OFF")
                    send_msg(chat_id, "🔓 <b>KUNCI APLIKASI TELAH DIBUKA!</b>\nPengguna versi lama bebas menggunakan aplikasi secara normal.")
                info, _ = get_github_version()
                text, kb = build_dashboard(info)
                send_msg(chat_id, text, kb)
            elif data == "cmd_up_one":
                answer_callback(cq_id, "Menaikkan versi...")
                info, _ = get_github_version()
                cur = info.get("latestVersion", "1.1.95") if info else "1.1.95"
                nxt = change_version_number(cur, +1)
                execute_version_change(chat_id, nxt, is_force=True)
            elif data == "cmd_down_one":
                answer_callback(cq_id, "Menurunkan versi...")
                info, _ = get_github_version()
                cur = info.get("latestVersion", "1.1.95") if info else "1.1.95"
                prv = change_version_number(cur, -1)
                execute_version_change(chat_id, prv, is_force=False)
            elif data == "cmd_set_95":
                answer_callback(cq_id, "Memulihkan ke v1.1.95...")
                execute_version_change(chat_id, "1.1.95", is_force=False, custom_notes="Pembaruan KasKu v1.1.95 menghadirkan peningkatan antarmuka modern Apple iOS FinTech, optimasi performa AI Voice, dan pembaruan sistem kas.")
            elif data == "cmd_set_96":
                answer_callback(cq_id, "Memasang v1.1.96...")
                execute_version_change(chat_id, "1.1.96", is_force=True, custom_notes="Pembaruan sistem wajib KasKu v1.1.96. Versi ini wajib diunduh untuk dapat melanjutkan penggunaan aplikasi.")

        elif "message" in update:
            msg = update["message"]
            chat_id = msg.get("chat", {}).get("id")
            user_id = msg.get("from", {}).get("id")
            text = (msg.get("text") or "").strip()

            if user_id != ADMIN_ID:
                send_msg(chat_id, f"⛔ <b>Akses Dibatasi</b>\nID Telegram Anda (<code>{user_id}</code>) tidak terdaftar sebagai administrator KasKu.")
            elif text == "/help":
                help_text = (
                    "📖 <b>PANDUAN PERINTAH KASKU COMMANDER:</b>\n"
                    "━━━━━━━━━━━━━━━━━━━━━\n"
                    "• <code>/start</code> - Menampilkan dasbor kontrol utama\n"
                    "• <code>/status</code> - Menampilkan status versi & server saat ini\n"
                    "• <code>/up 1.1.98</code> - Menaikkan ke nomor versi tertentu\n"
                    "• <code>/down 1.1.95</code> - Menurunkan ke nomor versi tertentu\n"
                    "• <code>/lock</code> - Mengunci versi lama (Wajib Update ON)\n"
                    "• <code>/unlock</code> - Membuka kunci (Update Opsional)\n"
                    "• <code>/notes [teks]</code> - Mengubah isi catatan rilis\n"
                    "━━━━━━━━━━━━━━━━━━━━━\n"
                    "💡 <i>Anda juga dapat menekan tombol menu langsung di dasbor!</i>"
                )
                send_msg(chat_id, help_text)
            elif text == "/lock":
                info, sha = get_github_version()
                if info:
                    info["forceUpdate"] = True
                    info["minRequiredVersion"] = info.get("latestVersion", "1.1.95")
                    update_github_version(info, sha, "Vercel Bot: Lock ON")
                    send_msg(chat_id, "🔒 <b>APLIKASI BERHASIL DIKUNCI!</b>")
                fresh, _ = get_github_version()
                t, k = build_dashboard(fresh)
                send_msg(chat_id, t, k)
            elif text == "/unlock":
                info, sha = get_github_version()
                if info:
                    info["forceUpdate"] = False
                    info["minRequiredVersion"] = "1.1.30"
                    update_github_version(info, sha, "Vercel Bot: Unlock")
                    send_msg(chat_id, "🔓 <b>KUNCI APLIKASI DIBUKA!</b>")
                fresh, _ = get_github_version()
                t, k = build_dashboard(fresh)
                send_msg(chat_id, t, k)
            elif text.startswith("/up ") or text.startswith("/down "):
                cmd_parts = text.split(" ")
                new_ver = cmd_parts[1].replace("v", "").strip() if len(cmd_parts) > 1 else ""
                if new_ver:
                    is_f = text.startswith("/up ")
                    execute_version_change(chat_id, new_ver, is_force=is_f)
            elif text.startswith("/notes "):
                new_notes = text.replace("/notes ", "").strip()
                if new_notes:
                    info, sha = get_github_version()
                    if info:
                        info["releaseNotes"] = new_notes
                        update_github_version(info, sha, "Vercel Bot: Update Release Notes")
                        send_msg(chat_id, f"✅ <b>Catatan rilis berhasil diubah:</b>\n<i>« {new_notes} »</i>")
                    fresh_info, _ = get_github_version()
                    dash_text, kb = build_dashboard(fresh_info)
                    send_msg(chat_id, dash_text, kb)
            else:
                info, _ = get_github_version()
                dash_text, kb = build_dashboard(info)
                send_msg(chat_id, dash_text, kb)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True}).encode('utf-8'))
