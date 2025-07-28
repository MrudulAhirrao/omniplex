import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const ALPHA_BASE = "https://www.alphavantage.co/query";

const fetchJSON = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
  return response.json();
};

type ChartDataPoint = {
  timestamp: string;
  price: number;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const urls = {
      quote: `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      profile: `${FINNHUB_BASE}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      metrics: `${FINNHUB_BASE}/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`,
      alpha: `${ALPHA_BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
    };

    const results = await Promise.allSettled([
      fetchJSON(urls.quote),
      fetchJSON(urls.profile),
      fetchJSON(urls.metrics),
      fetchJSON(urls.alpha),
    ]);

    const [quoteData, profileData, metricsData, alphaData] = results.map((r) =>
      r.status === "fulfilled" ? r.value : null
    );

    if (!quoteData || !profileData || !metricsData) {
      console.warn("Some essential stock data failed to load");
      return NextResponse.json({ error: "Data not available" }, { status: 502 });
    }

    let chartData: ChartDataPoint[] = [];
    const dailySeries = alphaData?.["Time Series (Daily)"];
    if (dailySeries) {
      chartData = Object.entries(dailySeries).map(([timestamp, data]: any) => ({
        timestamp: new Date(timestamp).toISOString(),
        price: parseFloat(data["4. close"]),
      }));
    }

    const changeAmt = quoteData.c - quoteData.pc;
    const changePct = (changeAmt / quoteData.pc) * 100;

    const responseData = {
      companyName: profileData.name || symbol,
      ticker: symbol,
      exchange: profileData.exchange || "N/A",
      currentPrice: quoteData.c,
      change: {
        amount: parseFloat(changeAmt.toFixed(2)),
        percentage: parseFloat(changePct.toFixed(2)),
      },
      chartData,
      open: quoteData.o,
      high: quoteData.h,
      low: quoteData.l,
      previousClose: quoteData.pc,
      marketCap: metricsData.metric?.marketCapitalization ?? null,
      peRatio: metricsData.metric?.peBasicExclExtraTTM ?? null,
      dividendYield: metricsData.metric?.dividendYieldIndicatedAnnual
        ? `${(metricsData.metric.dividendYieldIndicatedAnnual * 100).toFixed(2)}%`
        : "N/A",
      high52Week: metricsData.metric?.["52WeekHigh"] ?? null,
      low52Week: metricsData.metric?.["52WeekLow"] ?? null,
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("Unhandled error in stock API:", err);
    return NextResponse.json(
      { error: "Internal Server Error while fetching stock data" },
      { status: 500 }
    );
  }
}
