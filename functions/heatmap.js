import { getHeatMap } from "../src";

let getAverage = (arr) => {
  let reducer = (total, currentValue) => total + currentValue;
  let sum = arr.reduce(reducer);
  return sum / arr.length;
};

export const handler = async (event, context) => {
  var videoUrl = "https://www.youtube.com/watch?v=95PnFRjh-IE";
  const heatmapFullList = await getHeatMap(videoUrl);
  const scoreList = heatmapFullList.map(
    (person) => person.heatMarkerIntensityScoreNormalized
  );
  const scoreAverage = getAverage(scoreList);

  const bestMoments = heatmapFullList.filter(
    (heatmap) => heatmap.heatMarkerIntensityScoreNormalized >= scoreAverage
  );

  const maxHeatMarker = heatmapFullList.reduce((prev, current) =>
    prev.heatMarkerIntensityScoreNormalized >
    current.heatMarkerIntensityScoreNormalized
      ? prev
      : current
  );

  const minHeatMarker = heatmapFullList.reduce((prev, current) =>
    prev.heatMarkerIntensityScoreNormalized <
    current.heatMarkerIntensityScoreNormalized
      ? prev
      : current
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "Ok",
      data: {
        heatmap: heatmapFullList,
        scoreAverage: scoreAverage,
        bestMoments: bestMoments,
        maxHeatMarker,
        minHeatMarker
      },
    }),
  };
};
