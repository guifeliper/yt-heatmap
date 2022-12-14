import puppeteer from "puppeteer";
import fs from "fs";

async function getHtml(url, options) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  const html = await page.content();
  await page?.close();
  await browser?.close();
  return html;
}

async function getYTInitialData(html) {
  const ytDutyData = html.split('">var ytInitialData = ', 3);
  const ytInitialData = JSON.parse(ytDutyData[1].split(";</script>", 2)[0]);
  fs.writeFile(
    "assets/yttInitialData.json",
    JSON.stringify(ytInitialData, null, " "),
    function (err) {
      if (err) return console.log(err);
      console.log("All your initial data is on ytInitialData.json");
    }
  );
  return ytInitialData;
}

async function getJSONFromHTML(url) {
  const html = await getHtml(url, {});
  return await getYTInitialData(html);
}

export async function getHeatMap(url) {
  try {
    const ytInitialData = await getJSONFromHTML(url, {});
    var markerMap =
      ytInitialData["playerOverlays"]["playerOverlayRenderer"][
        "decoratedPlayerBarRenderer"
      ]["decoratedPlayerBarRenderer"]["playerBar"][
        "multiMarkersPlayerBarRenderer"
      ]["markersMap"].pop();
    var mostReplayed = markerMap["value"]["heatmap"]["heatmapRenderer"][
      "heatMarkers"
    ].map((item) => {
      const timeRangeMillis =
        item["heatMarkerRenderer"].timeRangeStartMillis / 1000;
      const markerDurationMillis =
        item["heatMarkerRenderer"].markerDurationMillis / 1000;
      return {
        timeRangeStartSeconds: timeRangeMillis,
        markerDurationSeconds: markerDurationMillis,
        heatMarkerIntensityScoreNormalized:
          item["heatMarkerRenderer"].heatMarkerIntensityScoreNormalized,
      };
    });
    return mostReplayed;
  } catch (error) {
    console.error("I am sorry, I could not find the data \n", error);
  }
}

var videoUrl = "https://www.youtube.com/watch?v=95PnFRjh-IE";

getHeatMap(videoUrl).then((res) => {
  console.log(res);
});
