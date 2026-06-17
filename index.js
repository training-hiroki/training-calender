async function loadJson() {
  try {
    const url =
      "https://raw.githubusercontent.com/user/repo/main/data.json";

      //4行目変更点あり

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

loadJson();