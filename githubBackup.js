const fs = require("fs");
const { exec } = require("child_process");

// data.jsonを読み込む
const data = JSON.parse(
  fs.readFileSync("data.json", "utf8")
);

console.log(`${data.length}件のデータを確認しました`);

// データが存在する場合のみ保存
if (data.length > 0) {

  exec("git add data.json", (err) => {
    if (err) {
      console.log(err);
      return;
    }

    exec('git commit -m "Update training data"', (err, stdout, stderr) => {

      // 変更なしの場合
      if (stderr.includes("nothing to commit")) {
        console.log("変更なし");
        return;
      }

      // 本当のエラー
      if (err) {
        console.log(err);
        return;
      }

      exec("git push origin main", (err, stdout) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log("GitHubへ自動保存完了");
        console.log(stdout);
      });
    });
  });

} else {
  console.log("保存するデータがありません");
}
}
