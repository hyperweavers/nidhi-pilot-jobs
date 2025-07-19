import axios from 'axios';
import { load } from 'cheerio';
import pdfParse from 'pdf-parse';
import dayjs from 'dayjs';

export interface HistoricalRate {
  date: Date;
  price: number;
}

export async function fetchHistoricalRates(): Promise<HistoricalRate[]> {
  // 1. Get PDF link from IBJA page
  const { data } = await axios.get('https://www.ibjarates.com');
  const $ = load(data);
  const selector = '#TodayRatesTableDataNo a[target="_blank"]';
  const link = $(selector).first().attr('href');

  if (!link) {
    throw new Error('PDF link not found');
  }

  const pdfUrl = link.startsWith('http')
    ? link
    : `https://www.ibjarates.com/${link}`;

  // 2. Download and parse PDF
  const pdfBuffer = (await axios.get(pdfUrl, { responseType: 'arraybuffer' }))
    .data;
  const pdfText = await pdfParse(pdfBuffer, { pagerender: render_page}).then((r) => r.text);
// console.log('=======')
// console.log(pdfText)
// console.log('========')
//   // 3. Extract lines, skipping first 2 header rows
//   const lines = pdfText
//     .split('\n')
//     .map((l) => l.trim())
//     .filter((l) => l)
//     .slice(2); // drop headers

//   const rates: HistoricalRate[] = [];

//   for (const line of lines) {
//     // Expect format: "01-Jan-25    65,000.00"
//     const parts = line.split(/\s{2,}/);
//     if (parts.length < 2) continue;

//     const [dateStr, priceStr] = parts;
//     const date = dayjs(dateStr, 'DD-MMM-YY').toDate();
//     const num = parseFloat(priceStr.replace(/[,A-Za-z]/g, ''));

//     if (!isNaN(num)) {
//       rates.push({ date, price: num });
//     }
//   }

//   // Keep only the last 30 valid entries
//   return rates.slice(-30);
// console.table(parseIbjaGoldPriceTable(pdfText))
return parseIbjaGoldPriceTable(pdfText);
}

function render_page(pageData: any) {
    //check documents https://mozilla.github.io/pdf.js/
    //ret.text = ret.text ? ret.text : "";

    let render_options = {
        //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
        normalizeWhitespace: false,
        //do not attempt to combine same line TextItem's. The default value is `false`.
        disableCombineTextItems: false
    }

    return pageData.getTextContent(render_options)
        .then(function(textContent: any) {
            let lastY, text = '';
            //https://github.com/mozilla/pdf.js/issues/8963
            //https://github.com/mozilla/pdf.js/issues/2140
            //https://gist.github.com/hubgit/600ec0c224481e910d2a0f883a7b98e3
            //https://gist.github.com/hubgit/600ec0c224481e910d2a0f883a7b98e3
            for (let item of textContent.items) {
                if (lastY == item.transform[5] || !lastY){
                    text += ' ' + item.str;
                }  
                else{
                    text += '\n' + item.str.trim();
                }    
                lastY = item.transform[5];
            }            
            //let strings = textContent.items.map(item => item.str);
            //let text = strings.join("\n");
            //text = text.replace(/[ ]+/ig," ");
            //ret.text = `${ret.text} ${text} \n\n`;
            return text;
        });
}

/**
 * Parses the raw text from pdf-parse and extracts the Gold 999 PM price per date.
 */
export function parseIbjaGoldPriceTable(pdfText: string): HistoricalRate[] {
  const lines = pdfText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const dateRegex = /^\d{1,2}-[A-Za-z]{3}-\d{2}$/;  
  const numericLineRegex = /^\d/; // line starting with digit

  const results: HistoricalRate[] = [];

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    const next = lines[i + 1];

    // 1) Identify a date line (DD-MMM-YY)
    // 2) Ensure the very next line starts with a number (so skip weekends/holidays)
    if (dateRegex.test(line) && numericLineRegex.test(next)) {
      // split on whitespace to get each column
      const cols = next.split(/\s+/);

      // Gold 999 PM is the **second** column (index 1)
      const pmStr = cols[1].replace(/,/g, '');

      const price = parseFloat(pmStr) / 10;
      if (!isNaN(price)) {
        results.push({
          date: dayjs(line, 'DD-MMM-YY').toDate(),
          price,
        });
      }
    }
  }

  return results;
}

