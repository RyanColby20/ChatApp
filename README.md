# ChatApp (Nodejs = React + Socket.io)
# Requiremeents
Node 20+
Node Package Manager (npm)
# TO RUN
# from repo root (first time only)
cd client && npm install && npm run build && cd ..
cd server && npm install && mkdir -p dist && cp -r ../client/dist/* ./dist/

# every time you want to run
node server.js
