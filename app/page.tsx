"use client";

import { useState } from "react";
import html2canvas from "html2canvas";

export default function Home() {

  const [url, setUrl] = useState("");
  const [video, setVideo] = useState<any>(null);
  const [impressions, setImpressions] = useState("0");
  const [views, setViews] = useState("0");
  const [editMode, setEditMode] = useState(false);
  const [percentageIncrease, setPercentageIncrease] = useState("0");

  function extractVideoId(link: string) {

    try {
      const url = new URL(link);

      if (url.searchParams.get("v")) {
        return url.searchParams.get("v");
      }

      if (url.hostname === "youtu.be") {
        return url.pathname.slice(1);
      }

      if (url.pathname.includes("/shorts/")) {
        return url.pathname.split("/shorts/")[1];
      }

      return null;

    } catch {
      return null;
    }

  }
  function formatNumber(num: string) {
    return Number(num).toLocaleString("en-US");
  }

  function formatDuration(duration: string) {
    const match = duration.match(/PT(\d+M)?(\d+S)?/);
    const minutes = match?.[1]?.replace("M", "") || "0";
    const seconds = match?.[2]?.replace("S", "") || "0";
    return `${minutes}:${seconds.padStart(2, "0")}`;
  }

  function handlePercentageChange(value: string) {
    setPercentageIncrease(value);

    const viewNum = Number(views);
    const percent = Number(value);

    if (!isNaN(viewNum) && !isNaN(percent)) {
      const newImpr = Math.round(viewNum * (1 + percent / 100));
      setImpressions(newImpr.toString());
    }
  }

  async function analyzeVideo() {

    if (!url) {
      alert("Please paste a YouTube link");
      return;
    }

    const id = extractVideoId(url);

    if (!id) {
      alert("Invalid YouTube link");
      return;
    }

    // reset previous state
    setVideo(null);
    setImpressions("0");
    setViews("0");

    const res = await fetch(`/api/youtube?id=${id}`);
    const data = await res.json();

    const videoData = data.items[0];

    const viewCount = Number(videoData.statistics?.viewCount || 0);

    setViews(viewCount.toString());
    setImpressions("0");
    setVideo(videoData);
  }

  function handleViewChange(value: string) {
    setViews(value);

    const viewNum = Number(value);
    const percent = Number(percentageIncrease);

    if (!isNaN(viewNum) && !isNaN(percent)) {
      const newImpr = Math.round(viewNum * (1 + percent / 100));
      setImpressions(newImpr.toString());
    }
  }

  async function downloadRow() {

    const capture = document.getElementById("capture-area");

    if (!capture) return;

    const canvas = await html2canvas(capture, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true
    });

    const link = document.createElement("a");

    const fileName = video?.snippet?.title
      ?.replace(/[\\/:*?"<>|]/g, "")
      ?.replace(/\s+/g, "-");

    link.download = `${fileName || "youtube-report"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function clearSearch() {
    setUrl("");
    setVideo(null);
    setViews("0");
    setImpressions("0");
    setPercentageIncrease("0");
  }

  return (
    <main className="page-container">

      <h1 className="page-title">
        GAds Video Campaign Screenshot
      </h1>

      <div className="search-section" style={{ display: "flex", gap: "10px", alignItems: "center" }}>

        <div style={{ position: "relative" }}>

          <input
            type="text"
            placeholder="Paste YouTube link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="search-input"
            style={{ paddingRight: "30px" }}
          />

          {url && (
            <button
              onClick={clearSearch}
              style={{
                position: "absolute",
                right: "5px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              ✕
            </button>
          )}

        </div>

        <button
          onClick={analyzeVideo}
          className="search-btn"
        >
          Analyze Video
        </button>

      </div>

      {video && (

        <div className="table-section">

          <div id="capture-area">

            <table className="ads-table">

              <thead>
                <tr>

                  <th className="th-left">
                    <input type="checkbox" className="header-checkbox" />
                    <div className="video-th-title">
                      Video <span className="sort-arrow">↑</span>
                    </div>
                  </th>

                  <th className="th-right">Impr.</th>

                  <th className="th-right">TrueView views</th>

                </tr>
              </thead>

              <tbody>

                <tr>

                  <td className="video-cell">

                    <input type="checkbox" className="row-checkbox" />

                    <img
                      src={video.snippet.thumbnails.medium.url}
                      className="thumb"
                    />

                    <div>

                      <p className="video-title">
                        {video.snippet.title}
                      </p>

                      <p className="video-meta">
                        {formatDuration(video.contentDetails.duration)} • {video.snippet.channelTitle}
                      </p>

                      <a
                        href={`https://www.youtube.com/channel/${video.snippet.channelId}`}
                        target="_blank"
                        className="video-link"
                      >
                        Link YouTube channel or video
                      </a>

                    </div>

                  </td>

                  <td className="number-cell">
                    {formatNumber(impressions)}
                  </td>

                  <td className="number-cell">

                    {editMode ? (

                      <input
                        type="number"
                        value={views}
                        onChange={(e) => handleViewChange(e.target.value)}
                        className="input-num no-spinner"
                      />

                    ) : (

                      formatNumber(views)

                    )}

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

          <div className="table-actions" style={{ display: "flex", gap: "15px", alignItems: "center" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <label style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>Increase Impressions:</label>
              <input
                type="number"
                value={percentageIncrease}
                onChange={(e) => handlePercentageChange(e.target.value)}
                placeholder="%"
                style={{
                  width: "80px",
                  padding: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  textAlign: "right"
                }}
              />
              <span style={{ fontWeight: "bold" }}>%</span>
            </div>

            {!editMode ? (

              <button
                onClick={() => setEditMode(true)}
                className="download-btn"
              >
                Edit
              </button>

            ) : (

              <button
                onClick={() => setEditMode(false)}
                className="download-btn"
              >
                Save
              </button>

            )}

            <button
              onClick={downloadRow}
              className="download-btn"
            >
              Download
            </button>

          </div>

        </div>

      )}

    </main>
  );
}