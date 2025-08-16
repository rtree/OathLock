#!/bin/bash

SESSION="oathlock-dev"  # 任意のセッション名に変更可
PROJECT_DIR="$HOME/OathLock"  # 任意のパスに変更可

# セッションが存在しない場合に作成
tmux has-session -t "$SESSION" 2>/dev/null
if [ $? != 0 ]; then
  tmux new-session -d -s "$SESSION" -n dev -c "$PROJECT_DIR"
  tmux split-window -h -c "$PROJECT_DIR"
  tmux split-window -v -t "$SESSION":0.0 -c "$PROJECT_DIR"
  tmux split-window -v -t "$SESSION":0.1 -c "$PROJECT_DIR"
fi

tmux send-keys -t "$SESSION":0.0 "cd $PROJECT_DIR/product/frontend && npm install && npm run dev" C-m

tmux send-keys -t "$SESSION":0.2 "cd $PROJECT_DIR" C-m

# Bottom-right: git pull loop
tmux send-keys -t "$SESSION":0.3 "while true; do cd $PROJECT_DIR && git pull -v && cd $PROJECT_DIR/product/frontend && npm install; sleep 3; done" C-m

# セッションを表示
tmux attach-session -t "$SESSION"