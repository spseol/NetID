from flask import Flask, jsonify, send_from_directory
from datetime import datetime
import locale

# from werkzeug.security import generate_password_hash, check_password_hash
locale.setlocale(locale.LC_ALL, "cs_CZ.utf8")

app = Flask(__name__)
app.secret_key = (
    b'\xf4\xcf\xed\xbc\x06sE6+"\x06\x84\x00\x99S\xb4\xd2\xa1\x80\x98\x86\x195\xdf'
)


class NetID:
    def __init__(self, ID):
        self.ID = ID
        self.ctime = datetime.now()  # create/change time
        self.atime = datetime.now()  # access time

    def get(self):
        self.atime = datetime.now()  # access time
        return self.ID

    def __str__(self):
        return str(self.ID)

    def __repr__(self):
        return f"NetID({self.ID})"


class Nicks(dict):
    IDs = (
        list(range(230, 300))
        + list(range(330, 400))
        + list(range(430, 500))
        + list(range(530, 600))
        + list(range(630, 700))
        + list(range(730, 800))
        + list(range(830, 900))
        + list(range(930, 1000))
    )

    def get(self, nick):
        if nick not in self:
            # Pokud je volné ID použiju ho
            if len(self.IDs) > 0:
                ID = self.IDs.pop(0)
            # pokud není volné ID použiju to nejstarší -- nejméně používané
            else:
                old = next(iter(self))
                for key in self:
                    if self[key].atime < self[old].atime:
                        old = key
                # print("old:", old)
                ID = self[old].ID
                self.pop(old)
            self[nick] = NetID(ID)
        r = self[nick].get()
        # for nick in self:
        #     print(f"{nick}: Create at {self[nick].ctime}. Use at {self[nick].atime}.")
        return r


@app.route("/", methods=["GET"])
def index():
    return send_from_directory(".", "index.html")


@app.route("/get/<nick>")
def text(nick):
    return str(nicks.get(nick))


@app.route("/status")
def status():
    s = {}
    for nick in nicks:
        netid = {}
        netid["id"] = nicks[nick].ID
        netid["ctime"] = nicks[nick].ctime.strftime("%c")
        netid["atime"] = nicks[nick].atime.strftime("%c")
        netid["atime_diff"] = (datetime.now() - nicks[nick].atime).seconds
        netid["ctime_diff"] = (datetime.now() - nicks[nick].ctime).seconds
        s[nick] = netid
    return jsonify(s)


nicks = Nicks()
