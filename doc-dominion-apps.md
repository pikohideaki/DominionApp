
# ToDo

* 動作チェック

* 作業
    * my-own-library 同期

* 機能追加
    * 闇市場デッキ
        * 3枚めくるを押した人以外にはボタンを表示しないように
        * 保険でリセットボタンはつけるべきか

* 作業記録
    * lastTurnPlayerNameをnewGameResultに含めた
    * CardPropertyDialogComponent
        * cardではなくcardIndexなどを入力に
        * cardPropertyListはこの内部で読み込み
        （component.instanceで渡すと、そのためだけにsubscribeしているcomponentが多数あるので）
    * sign-in-to-the-game-dialog の selectingRoomRemoved を変更した


* 勝利点カードリストに変更があった場合に更新する場所
    * \src\dominion\online-randomizer\add-game-result\number-of-victory-cards-string.service.ts
    * \src\dominion\sub-components\victory-points-calculator\victory-points-calculator.service.ts
    * \src\app\classes\number-of-victory-cards.ts


* メモ
    * import 'rxjs/add/observable/combineLatest';
    * import 'rxjs/add/operator/takeWhile';
    * a.withLatestFrom(b) か a.combineLatest(b) か
        * a のみで発火すればよいときは withLatestFrom だが，
            a, b 最初の値がそろったときに一度発火したい場合で b が遅いことがあり得る場合，
            最初の値がそろったときの発火が行われないので，combineLatestを使わざるを得ない．
            withLatestFrom は1個目の値でのみ発火したい場合か，
            最初の値がそろった時に発火したい場合で2つ目の値が必ず1つ目の値より先に発火している場合
            のみ使用できる．
