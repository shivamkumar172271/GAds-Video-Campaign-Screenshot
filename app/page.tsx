"use client";

import { useState } from "react";
import html2canvas from "html2canvas";

export default function Home() {

  const [url, setUrl] = useState("");
  const [video, setVideo] = useState<any>(null);
  const [impressions, setImpressions] = useState("0");
  const [views, setViews] = useState("0");
  const [editMode, setEditMode] = useState(false);

  function extractVideoId(link: string) {
    const regExp = /v=([^&]+)/;
    const match = link.match(regExp);
    return match ? match[1] : null;
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

  async function analyzeVideo() {

    const id = extractVideoId(url);

    if (!id) {
      alert("Invalid YouTube link");
      return;
    }

    const res = await fetch(`/api/youtube?id=${id}`);
    const data = await res.json();

    const videoData = data.items[0];

    const viewCount = Number(videoData.statistics?.viewCount || 0);

    setViews(viewCount.toString());

    const calculatedImpressions = Math.round(viewCount * 1.43);

    setImpressions(calculatedImpressions.toString());

    setVideo(videoData);
  }

  function handleViewChange(value: string) {

    setViews(value);

    const viewNum = Number(value);

    if (!isNaN(viewNum)) {

      const newImpressions = Math.round(viewNum * 1.43);

      setImpressions(newImpressions.toString());
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

    link.download = "youtube-report.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <main className="page-container">

      <h1 className="page-title">
        GAds Video Campaign Screenshot
      </h1>

      <div className="search-section">

        <input
          type="text"
          placeholder="Paste YouTube link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="search-input"
        />

        <button
          onClick={analyzeVideo}
          className="search-btn"
        >
          Analyze Video
        </button>

      </div>

      {video && (

        <div className="table-section">

          {/* ONLY TABLE IS CAPTURED */}
          <div id="capture-area">

            <table className="ads-table">

              <thead>
                <tr>

                  <th className="th-left">
                    <input type="checkbox" className="header-checkbox" />
                    Video <span className="sort-arrow">↑</span>
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

                    {editMode ? (

                      <input
                        type="number"
                        value={impressions}
                        readOnly
                        className="input-num"
                      />

                    ) : (

                      formatNumber(impressions)

                    )}

                  </td>

                  <td className="number-cell">

                    {editMode ? (

                      <input
                        type="number"
                        value={views}
                        onChange={(e) => handleViewChange(e.target.value)}
                        className="input-num"
                      />

                    ) : (

                      formatNumber(views)

                    )}

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

          {/* BUTTONS OUTSIDE SCREENSHOT AREA */}

          <div className="table-actions">

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