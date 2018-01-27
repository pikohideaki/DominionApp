
# ToDo
* DataTable: debounceはどれにかけるべきか

* 動作チェック
    * sign-in-to-the-game-dialog の selectingRoomRemoved を変更した

* 作業
    * my-own-library 同期

* 機能追加
    * data-table
        * filteredDataに該当要素が無いselectorをdisabledする
    * ゲーム結果送信後にrotationもする
    * 結果入力画面に勝利点内訳も表示


* 作業記録
    * lastTurnPlayerNameをnewGameResultに含めた
    * CardPropertyDialogComponent
        * cardではなくcardIndexなどを入力に
        * cardPropertyListはこの内部で読み込み
        （component.instanceで渡すと、そのためだけにsubscribeしているcomponentが多数あるので）
