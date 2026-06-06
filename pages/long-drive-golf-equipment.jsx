import { SeoPage, SeoH1, SeoH2, SeoP, SeoTable, SeoCTA } from '../components/SeoPageLayout';
export default function Page({ entries=[] }) {
  const approved = entries.filter(e=>e.dist>0&&e.club);
  const brands = Object.entries(approved.reduce((acc,e)=>{const b=e.club.split(' ')[0];acc[b]=(acc[b]||0)+1;return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,8);
  return (
    <SeoPage title="Best Golf Equipment For Long Drive | Ripping Bombs" description="What equipment do the biggest hitters use? See the most popular drivers from verified competition longest drive data on Ripping Bombs.">
      <SeoH1>Best Golf Equipment For Long Drive</SeoH1>
      <SeoP>Equipment choice matters for distance — but perhaps not as much as most golfers think. The right driver for maximum distance is the one that's properly fitted to your swing. That said, certain brands consistently appear at the top of long drive competition results.</SeoP>
      <SeoH2>Most Popular Drivers In Competition Longest Drives</SeoH2>
      <SeoTable headers={['Driver Brand','Appearances In Top Drives']} rows={brands.map(([brand,count])=>[brand,count])}/>
      <SeoH2>What To Look For In A Long Drive Driver</SeoH2>
      <SeoTable headers={['Feature','What To Look For','Why It Matters']} rows={[['Loft','9–10.5° for most golfers','Affects launch angle and spin'],['Shaft','Stiff or X-stiff for fast swingers','Too flexible adds spin and kills distance'],['Head size','460cc maximum (rules legal)','Larger sweet spot for off-centre hits'],['Face technology','Variable thickness face','Faster ball speeds across the face'],['Adjustability','Adjustable hosel and weights','Fine-tune for your optimal launch conditions']]}/>
      <SeoH2>Get Fitted Before You Buy</SeoH2>
      <SeoP>The most important piece of equipment advice: get properly fitted before buying any new driver. A well-fitted 3-year-old driver will outperform a brand new one that doesn't suit your swing. Most major brands offer free fitting sessions and the gains from optimised launch conditions can easily exceed 20 yards.</SeoP>
      <SeoCTA/>
    </SeoPage>
  );
}
