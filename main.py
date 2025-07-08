from flask import Flask
from flask_cors import CORS
from code_app.routes import code_bp
from monitor_app.routes import monitor_bp
from verify_app.routes import verify_bp

app = Flask(__name__)
CORS(app)

# Register blueprints with their URL prefixes
app.register_blueprint(code_bp, url_prefix='/code')
app.register_blueprint(monitor_bp, url_prefix='/monitor')
app.register_blueprint(verify_bp, url_prefix='/verify')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 