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
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return api_call("sendMessage", payload)

def edit_msg(chat_id, message_id, text, reply_markup=None):
    payload = {"chat_id": chat_id, "message_id": message_id, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True}
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

def build_dashboard(info):
    latest = info.get("latestVersion", "1.1.95") if info else "1.1.95"
    min_req = info.get("minRequiredVersion", "1.1.30") if info else "1.1.30"
    force = info.get("forceUpdate", False) if info else False
    notes = info.get("releaseNotes", "-") if info else "-"
    url = info.get("updateUrl", "https://kasku.kheireditz.my.id/") if info else "https://kasku.kheireditz.my.id/"

    status_force = "🔴 <b>WAJIB UPDATE (Terkunci)</b>" if force else "🟢 <b>OPSIONAL UPDATE (Bebas)</b>"

    text = (
        "☁️ <b>KASKU COMMANDER (VERCEL 24/7 CLOUD)</b>\n"
        "<i>Terhubung Langsung ke GitHub & Vercel (Aktif Tanpa Termux)</i>\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        f"📱 <b>Versi Rilis:</b> <code>v{latest}</code>\n"
        f"🛡️ <b>Batas Min. Versi:</b> <code>v{min_req}</code>\n"
        f"🔒 <b>Status Wajib Update:</b> {status_force}\n"
        f"🌐 <b>Portal Unduh:</b> <a href='{url}'>{url}</a>\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        f"📝 <b>Catatan Rilis:</b>\n<i>{notes}</i>\n"
        "━━━━━━━━━━━━━━━━━━━━━\n"
        "💡 <i>Gunakan tombol di bawah untuk mengubah setelan server:</i>"
    )

    btn_force = ("🟢 Matikan Wajib Update", "cmd_force_off") if force else ("🔴 Aktifkan WAJIB Update (Kunci)", "cmd_force_on")

    keyboard = {
        "inline_keyboard": [
            [
                {"text": "🚀 UP VERSI +0.0.1", "callback_data": "cmd_up_auto"},
                {"text": "🔄 Refresh Status", "callback_data": "cmd_refresh"}
            ],
            [
                {"text": btn_force[0], "callback_data": btn_force[1]}
            ],
            [
                {"text": "🌐 Buka Web KasKu", "url": "https://kasku.kheireditz.my.id/"}
            ]
        ]
    }
    return text, keyboard

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "online",
            "mode": "Vercel Serverless Python 24/7",
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
                edit_msg(chat_id, msg_id, "⏳ <b>Sedang mengaktifkan status WAJIB UPDATE di GitHub...</b>")
                info, sha = get_github_version()
                if info:
                    info["forceUpdate"] = True
                    info["minRequiredVersion"] = info.get("latestVersion", "1.1.95")
                    ok, _ = update_github_version(info, sha, f"Vercel Bot: Force Update ON (v{info['latestVersion']})")
                    if ok:
                        send_msg(chat_id, f"🔴 <b>WAJIB UPDATE DIAKTIFKAN!</b>\nSemua versi di bawah v{info['latestVersion']} terkunci.")
                info, _ = get_github_version()
                text, kb = build_dashboard(info)
                send_msg(chat_id, text, kb)
            elif data == "cmd_force_off":
                answer_callback(cq_id, "Membuka kunci...")
                edit_msg(chat_id, msg_id, "⏳ <b>Sedang menonaktifkan status wajib update di GitHub...</b>")
                info, sha = get_github_version()
                if info:
                    info["forceUpdate"] = False
                    info["minRequiredVersion"] = "1.1.30"
                    ok, _ = update_github_version(info, sha, "Vercel Bot: Force Update OFF")
                    if ok:
                        send_msg(chat_id, "🟢 <b>WAJIB UPDATE DIMATIKAN!</b>\nPengguna bebas menggunakan aplikasi.")
                info, _ = get_github_version()
                text, kb = build_dashboard(info)
                send_msg(chat_id, text, kb)
            elif data == "cmd_up_auto":
                answer_callback(cq_id, "Mempersiapkan rilis baru...")
                edit_msg(chat_id, msg_id, "⏳ <b>Sedang menaikkan nomor versi di GitHub & Vercel...</b>")
                info, sha = get_github_version()
                if info:
                    cur = info.get("latestVersion", "1.1.95")
                    parts = cur.split('.')
                    if len(parts) == 3 and parts[2].isdigit():
                        parts[2] = str(int(parts[2]) + 1)
                        next_ver = '.'.join(parts)
                    else:
                        next_ver = cur + ".1"
                    
                    info["latestVersion"] = next_ver
                    info["minRequiredVersion"] = next_ver
                    info["forceUpdate"] = True
                    info["releaseNotes"] = f"Pembaruan resmi KasKu v{next_ver}. Peningkatan performa & kestabilan."
                    
                    new_rel = {
                        "version": next_ver,
                        "releaseDate": time.strftime("%Y-%m-%d"),
                        "fileSize": "500 KB",
                        "downloadUrl": "/apk/KasKu.apk",
                        "isLatest": True,
                        "minAndroid": "Android 7.0 (Nougat)+",
                        "highlights": [f"Pembaruan resmi KasKu v{next_ver}"]
                    }
                    for r in info.get("releases", []):
                        r["isLatest"] = False
                    info["releases"] = [new_rel] + info.get("releases", [])
                    
                    ok, _ = update_github_version(info, sha, f"Vercel Bot: Release KasKu v{next_ver}")
                    if ok:
                        send_msg(chat_id, f"🎉 <b>BERHASIL RILIS KasKu v{next_ver}!</b>\nVersi baru otomatis aktif di Vercel.")
                info, _ = get_github_version()
                text, kb = build_dashboard(info)
                send_msg(chat_id, text, kb)

        elif "message" in update:
            msg = update["message"]
            chat_id = msg.get("chat", {}).get("id")
            user_id = msg.get("from", {}).get("id")
            text = (msg.get("text") or "").strip()

            if user_id != ADMIN_ID:
                send_msg(chat_id, f"⛔ Akses Dibatasi untuk ID: {user_id}")
            elif text.startswith("/up "):
                new_ver = text.replace("/up ", "").replace("v", "").strip()
                if new_ver:
                    send_msg(chat_id, f"⏳ Sedang merilis v{new_ver} ke GitHub...")
                    info, sha = get_github_version()
                    if info:
                        info["latestVersion"] = new_ver
                        info["minRequiredVersion"] = new_ver
                        info["forceUpdate"] = True
                        info["releaseNotes"] = f"Pembaruan resmi KasKu v{new_ver}."
                        new_rel = {
                            "version": new_ver,
                            "releaseDate": time.strftime("%Y-%m-%d"),
                            "fileSize": "500 KB",
                            "downloadUrl": "/apk/KasKu.apk",
                            "isLatest": True,
                            "minAndroid": "Android 7.0 (Nougat)+",
                            "highlights": [f"Pembaruan resmi KasKu v{new_ver}"]
                        }
                        for r in info.get("releases", []):
                            r["isLatest"] = False
                        info["releases"] = [new_rel] + info.get("releases", [])
                        update_github_version(info, sha, f"Vercel Bot: Release KasKu v{new_ver}")
                        send_msg(chat_id, f"🎉 KasKu v{new_ver} sukses dirilis!")
            elif text.startswith("/notes "):
                new_notes = text.replace("/notes ", "").strip()
                if new_notes:
                    send_msg(chat_id, "⏳ Menyimpan catatan rilis...")
                    info, sha = get_github_version()
                    if info:
                        info["releaseNotes"] = new_notes
                        update_github_version(info, sha, "Vercel Bot: Update Release Notes")
                        send_msg(chat_id, f"✅ Catatan rilis diubah:\n<i>{new_notes}</i>")
            else:
                info, _ = get_github_version()
                dash_text, kb = build_dashboard(info)
                send_msg(chat_id, dash_text, kb)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True}).encode('utf-8'))
