/*jshint esversion: 6 */
/*jshint esversion: 8 */

// Define modules
const Request = require('request'),
    Cheerio = require('cheerio'),
    Iconv = require('iconv').Iconv,
    ChildProcessSpawn  = require('child_process').spawn;

const PARSING_URL = {
    NEWS: 'https://media.daum.net/ranking/popular?include=society,politics,culture,economic,foreign,digital',
    SPORTS: 'https://media.daum.net/ranking/popular?include=sports',
    ENT: 'https://media.daum.net/ranking/popular?include=entertain',
    RANK: 'https://www.naver.com/'
};

const MAX_NEWS_LIST_COUNT = 5;

const getNewsData = async (req, res, next) => {
  try {
    let crawlingNews = await _crawlingNews();
    let summarizedNews = await _summarizeNews(crawlingNews);

    let result = {
      news: summarizedNews.news,
      sports: summarizedNews.sports,
      ent: summarizedNews.ent
    };

    _setRespond(res, result);
  } catch(error) {
    throw new Error('Get news data error. ' + error);
  }
};

const _crawlingNews = async () => {
  try {
    let news = await _getTopNewsList(PARSING_URL.NEWS),
      sportNews = await _getTopNewsList(PARSING_URL.SPORTS),
      entNews = await _getTopNewsList(PARSING_URL.ENT);

    return {
      news: news,
      sports: sportNews,
      ent: entNews
    };
  } catch(error) {
    throw new Error('Crawling news error. ' + error);
  }
};

const _summarizeNews = async (data) => {
  try {
    const { news, sports, ent } = data;

    let summarizeNews = [],
      summarizeSport = [],
      summarizeEnt = [];

    await Promise.all(news.map(async (newsItem) => {
      let res = await _getSummarizeNewsContent(newsItem, 'news');
      summarizeNews.push(res);
      return;
    }));

    await Promise.all(sports.map(async (sportsItem) => {
      let res = await _getSummarizeNewsContent(sportsItem, 'sports');
      summarizeSport.push(res);
      return;
    }));

    await Promise.all(ent.map(async (entItem) => {
      let res = await _getSummarizeNewsContent(entItem, 'ent');
      summarizeEnt.push(res);
      return;
    }));


    return {
      news: summarizeNews,
      sports: summarizeSport,
      ent: summarizeEnt
    };
  } catch(error) {
    throw new Error('Summarize news error. ' + error);
  }
};

const _getRealRanking = async () => {
  try {
    let data = await _crawlingWeb(PARSING_URL.RANK);

    return new Promise((resolve, reject) => {
      let resultArr = [];

      let $ = Cheerio.load(data);
      let getData = $($('.ah_k'));

      getData.each(function (index, elem) {
        let result = $(this).text().trim();
        resultArr.push(result);

        if (getData.length === resultArr.length) {
          resolve(resultArr);
        }
      });
    });
  } catch(error) {
    throw new Error('Get real ranking error. ' + error);
  }
};

const _crawlingWeb = (url) => {
  return new Promise((resolve, reject) => {
    Request({encoding: 'binary', method: 'GET', uri: url}, (error, res, body) => {
      if (!!error) {
          console.log('Get request error', error);
          reject(error);
      }

      try {
        let contents = new Buffer.from(body, 'binary');
        convertedBody = contents;

        if (_isEucKrPage(body)) {
          const euckr2utf8 = new Iconv('euc-kr', 'utf-8');
          convertedBody = euckr2utf8.convert(contents);
        }

        resolve(convertedBody);
      } catch (err) {
        console.log ('Parsing error', err);
        reject(err);
      }
      });
  });
};

const _getContent = (webBody, isGetContent) => {
    return new Promise((resolve, reject) => {
      let resultArr = [];

      let $ = Cheerio.load(webBody);
      let getData = $('a', 'strong', $('.cont_thumb'));

      if (isGetContent) {
          getData = $($('.article_view'));
      }

      getData.each(function (index, elem) {
        let result = $(this).text().trim();

        if (isGetContent) {
          // Make full content
          resultArr.push(result);
        } else {
          let link = $(this).attr('href');
          resultArr.push({
              title: result,
              link: link
          });
        }

        if (getData.length === resultArr.length) {
          if (isGetContent) {
              resolve(resultArr);
          } else {
              resolve(resultArr.slice(0, MAX_NEWS_LIST_COUNT));
          }
        }
      });
    });
};

const _getTopNewsList = async (url) => {
  try {
    let data = await _crawlingWeb(url);
    let content = await _getContent(data);

    return content;
  } catch(error) {
    throw new Error('Get top news list error. ' + error);
  }
};

const _getSummarizeNewsContent = async (newsData, newsType) => {
  try {
    let data = await _crawlingWeb(newsData.link);
    let content = await _getContent(data, true);
    let result = await _summarizeContent(content.join(''));

    return result;
  } catch(error) {
    throw new Error('Get news content error. ' + error);
  }
};

const _summarizeContent = (content) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = ChildProcessSpawn('python', ['app_server/lib/summarization.py', content]);

    pythonProcess.stdout.on('data', function(data) {
        let originData = Buffer.from(data, 'base64');
        resolve(originData.toString());
    });

    pythonProcess.stderr.on('data', function(error) {
        reject(error);
    });
  });
};

const _isEucKrPage = (body) => {
  return body.indexOf('euc-kr') > -1 ||
    body.indexOf('EUC-KR') > -1 ||
    body.indexOf('EUCKR') > -1;
};

const _setRespond = (respond, data) => {
  return respond.json(data);
};

const _errorRespond = (respond, error) => {
  return respond.status(403).json({
    message: error.message
  });
};

module.exports.getNewsData = getNewsData;
