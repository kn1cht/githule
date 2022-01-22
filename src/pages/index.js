import React, { useRef, useState, useEffect } from "react";
import ReactNotification, { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import Slider, { createSliderWithTooltip } from 'rc-slider';
const SliderWithTooltip = createSliderWithTooltip(Slider);
import 'rc-slider/assets/index.css';
import { fetchData, cleanUsername, contributionsToCounts, getDateStr, normalizedCountToColor } from "../utils/export";

import styles from '../styles/App.module.scss'

const INITIAL_LEN = 6;
const INITIAL_WIDTH = 7;
const MAX_LEN = 20;
const INITIAL_THRESHOLD = 0.3;
const SITE_URL = 'https://githule.vercel.app/';

const App = () => {
  const inputRef = useRef();
  const [canvasText, setCanvasText] = useState(Array(INITIAL_LEN).fill('⬜').map(i => new Array(INITIAL_WIDTH).fill(i)));
  const [clipboard, setClipboard] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [gitHubId, setGitHubId] = useState('');
  const [graphLength, setGraphLength] = useState(INITIAL_LEN);
  const [graphWidth, setGraphWidth] = useState(INITIAL_WIDTH);
  const [loading, setLoading] = useState(false);
  const [maxContributionCount, setMaxContributionCount] = useState(1);
  const [threshold, setThreshold] = useState(INITIAL_THRESHOLD);
  const [tweet, setTweet] = useState('');
  const [tweetUrl, setTweetUrl] = useState('');

  useEffect(() => {
    setClipboard(navigator.clipboard);
  }, []);
  useEffect(() => {
    if (!data) {
      return;
    }
    drawCanvas();
  }, [data, graphLength, graphWidth, threshold]);

  useEffect(() => {
    makeTweetText();
  }, [canvasText]);

  const handleSubmit = e => {
    e.preventDefault();

    setGitHubId(cleanUsername(gitHubId));
    setLoading(true);
    setError(null);
    setData(null);

    fetchData(cleanUsername(gitHubId))
      .then(res => {
        setLoading(false);
        if (res.years.length === 0) {
          setError("Could not find your profile");
        } else {
          setData(res);
          inputRef.current.blur();
        }
      })
      .catch(err => {
        console.log(err);
        setError("I could not check your profile successfully...");
      });
  };
  const drawCanvas = () => {
    const counts = contributionsToCounts(data).slice(0, graphLength * graphWidth).reverse();
    console.log(counts);
    const maxCount = Math.max(counts.reduce((pre, cur) => Math.max(pre, cur)), 1);
    setMaxContributionCount(maxCount);

    let canvasTextNew = Array(graphLength).fill('⬜').map(i => new Array(graphWidth).fill(i));
    for(let i = 0; i <= graphLength; ++i) {
      const normalizedCountsInOneWeek = counts.slice(i * graphWidth, (i + 1) * graphWidth);
      canvasTextNew[i] = normalizedCountsInOneWeek.map(e => normalizedCountToColor(e / maxCount, threshold));
    }
    setCanvasText(canvasTextNew);
  }
  const makeTweetText = () => {
    const graphText = canvasText.map(e => e.join('')).join('\n') + '\n';
    console.log(graphText);
    setTweet(`GitHule ${getDateStr()} (${gitHubId})\n\n${graphText}\n${SITE_URL}`);
    setTweetUrl(
      encodeURI(`https://twitter.com/share?url=${SITE_URL}&text=GitHule ${getDateStr()} (${gitHubId})\n\n${graphText}`)
    );
  }
  const copyTweetToClipboard = () => {
    if(clipboard) {
      clipboard.writeText(tweet).then(() => {
        store.addNotification({
          message: 'Copied to clipboard',
          type: 'success',
          insert: 'top',
          container: 'top-right',
          showIcon: true,
          animationIn: ['animate__animated', 'animate__fadeIn'],
          animationOut: ['animate__animated', 'animate__fadeOut'],
          dismiss: {
            duration: 3000,
          }
        });
      });
    }
    else {
      store.addNotification({
        message: 'Failed to copy',
        type: 'warning',
        insert: 'top',
        container: 'top-right',
        showIcon: true,
        animationIn: ['animate__animated', 'animate__fadeIn'],
        animationOut: ['animate__animated', 'animate__fadeOut'],
        dismiss: {
          duration: 3000,
        }
      });
    }
  };
  const _renderError = () => {
    return (
      <div className="App-error App-centered">
        <p>{error}</p>
      </div>
    );
  };

  return (
    <>
      <ReactNotification />
      <div className="container">
        <header>
          <h1 className="title is-2 is-uppercase has-text-centered has-text-weight-bold">GitHule</h1>
        </header>
        <main className="block p-4">
          <div className="columns">
            <div className="column is-narrow">
              <label className="label">GitHub Username</label>
              <form onSubmit={handleSubmit} className="field has-addons">
                <p className="control">
                <input ref={inputRef} className="input is-medium" type="text"
                      name="github_id" value={gitHubId} pattern="^[A-Za-z\d\-]+$"
                      onChange={e => setGitHubId(e.target.value)} placeholder="Your GitHub Username" autoFocus />
                </p>
                <p className="control">
                <button type="submit" className="button is-medium is-dark"
                        disabled={gitHubId.length <= 0}>Draw</button>
                </p>
              </form>
              {error !== null && _renderError()}
              {data !== null && (
                <div className="buttons">
                  <a href={tweetUrl} className="button is-medium is-twitter" target="_blank" rel="noopener noreferrer">
                    <span className="icon">
                      <i className="fab fa-twitter"></i>
                    </span>
                    <span>Tweet</span>
                  </a>
                  <button className="button is-medium is-dark" onClick={copyTweetToClipboard}>
                    <span className="icon">
                      <i className="fas fa-clipboard"></i>
                    </span>
                    <span>Copy</span>
                  </button>
                </div>
              )}
              {data !== null && (
                <details>
                  <summary className="button">
                    <span className="icon">
                      <i className="fas fa-cog"></i>
                    </span>
                    <span>Advanced Settings</span>
                  </summary>
                  <div className={'box ' + styles['details-content']}>
                    <div className="block">
                      <h2 className="tittle is-3 has-text-weight-bold">
                        Yellow / Green threshold
                      </h2>
                      <SliderWithTooltip value={threshold * maxContributionCount}
                                        onChange={v => setThreshold(v / maxContributionCount)}
                                        min={0} max={maxContributionCount}
                                        step={1} dots={true} />
                    </div>
                    <div className="block">
                      <h2 className="tittle is-3 has-text-weight-bold">
                        Length
                      </h2>
                      <SliderWithTooltip value={graphLength}
                                        onChange={setGraphLength}
                                        min={3} max={MAX_LEN}
                                        step={1} dots={true} />
                    </div>
                    <div className="block">
                      <h2 className="tittle is-3 has-text-weight-bold">
                        Width
                      </h2>
                      <SliderWithTooltip value={graphWidth}
                                        onChange={setGraphWidth}
                                        min={5} max={7}
                                        step={1} dots={true} />
                    </div>
                  </div>
                </details>
              )}
            </div>
            <div className="column">
              from {getDateStr(graphLength * graphWidth)}
              <div className="is-size-3">
                {canvasText.map((row, rowIndex) => (
                  <div key={rowIndex}>
                    {row.map((text, columnIndex) => (
                      <span key={columnIndex}>{text}</span>
                    ))}
                  </div>
                ))}
              </div>
              to {getDateStr()}
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <a href="https://github.com/kn1cht/githule" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-github"></i> kn1cht/githule
          </a>
        </footer>
        <div className={'modal' + (loading === true ? ' is-active' : '')}>
          <div className="modal-background"></div>
          <div className={'modal-content fa-3x ' + styles.loading}>
            <i className="fas fa-spinner fa-pulse"></i>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
