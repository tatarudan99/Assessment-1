#!/usr/bin/env python3

from flask import Flask, render_template
from flask_cors import CORS


app = Flask(__name__)

cors = CORS(app, resources={r"/api/v1/*": {"origins": "*"}})

@app.route("/", strict_slashes=False)
def root():
    """render the root page for this application"""
    return(render_template("index.html"))

if __name__ == "__main__":
    app.run(host='0.0.0.0')
