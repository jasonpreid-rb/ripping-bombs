import { useEffect } from 'react';

// ISO 3166-1 alpha-2 code -> English short name, used to give flag images
// real descriptive alt text (previously just the raw 2-letter code, e.g.
// alt="DE" — not meaningful for screen readers or image-search crawlers).
const COUNTRY_NAMES = {AF:"Afghanistan",AL:"Albania",DZ:"Algeria",AS:"American Samoa",AD:"Andorra",AO:"Angola",AI:"Anguilla",AQ:"Antarctica",AG:"Antigua and Barbuda",AR:"Argentina",AM:"Armenia",AW:"Aruba",AU:"Australia",AT:"Austria",AZ:"Azerbaijan",BS:"Bahamas",BH:"Bahrain",BD:"Bangladesh",BB:"Barbados",BY:"Belarus",BE:"Belgium",BZ:"Belize",BJ:"Benin",BM:"Bermuda",BT:"Bhutan",BO:"Bolivia",BA:"Bosnia and Herzegovina",BW:"Botswana",BR:"Brazil",BN:"Brunei",BG:"Bulgaria",BF:"Burkina Faso",BI:"Burundi",KH:"Cambodia",CM:"Cameroon",CA:"Canada",CV:"Cabo Verde",KY:"Cayman Islands",CF:"Central African Republic",TD:"Chad",CL:"Chile",CN:"China",CO:"Colombia",KM:"Comoros",CG:"Congo",CD:"DR Congo",CK:"Cook Islands",CR:"Costa Rica",CI:"Ivory Coast",HR:"Croatia",CU:"Cuba",CW:"Curacao",CY:"Cyprus",CZ:"Czechia",DK:"Denmark",DJ:"Djibouti",DM:"Dominica",DO:"Dominican Republic",EC:"Ecuador",EG:"Egypt",SV:"El Salvador",GQ:"Equatorial Guinea",ER:"Eritrea",EE:"Estonia",SZ:"Eswatini",ET:"Ethiopia",FJ:"Fiji",FI:"Finland",FR:"France",GA:"Gabon",GM:"Gambia",GE:"Georgia",DE:"Germany",GH:"Ghana",GI:"Gibraltar",GR:"Greece",GL:"Greenland",GD:"Grenada",GU:"Guam",GT:"Guatemala",GG:"Guernsey",GN:"Guinea",GW:"Guinea-Bissau",GY:"Guyana",HT:"Haiti",HN:"Honduras",HK:"Hong Kong",HU:"Hungary",IS:"Iceland",IN:"India",ID:"Indonesia",IR:"Iran",IQ:"Iraq",IE:"Ireland",IM:"Isle of Man",IL:"Israel",IT:"Italy",JM:"Jamaica",JP:"Japan",JE:"Jersey",JO:"Jordan",KZ:"Kazakhstan",KE:"Kenya",KI:"Kiribati",KW:"Kuwait",KG:"Kyrgyzstan",LA:"Laos",LV:"Latvia",LB:"Lebanon",LS:"Lesotho",LR:"Liberia",LY:"Libya",LI:"Liechtenstein",LT:"Lithuania",LU:"Luxembourg",MO:"Macao",MG:"Madagascar",MW:"Malawi",MY:"Malaysia",MV:"Maldives",ML:"Mali",MT:"Malta",MH:"Marshall Islands",MR:"Mauritania",MU:"Mauritius",MX:"Mexico",FM:"Micronesia",MD:"Moldova",MC:"Monaco",MN:"Mongolia",ME:"Montenegro",MS:"Montserrat",MA:"Morocco",MZ:"Mozambique",MM:"Myanmar",NA:"Namibia",NR:"Nauru",NP:"Nepal",NL:"Netherlands",NC:"New Caledonia",NZ:"New Zealand",NI:"Nicaragua",NE:"Niger",NG:"Nigeria",NU:"Niue",KP:"North Korea",MK:"North Macedonia",NO:"Norway",OM:"Oman",PK:"Pakistan",PW:"Palau",PS:"Palestine",PA:"Panama",PG:"Papua New Guinea",PY:"Paraguay",PE:"Peru",PH:"Philippines",PL:"Poland",PT:"Portugal",PR:"Puerto Rico",QA:"Qatar",RE:"Reunion",RO:"Romania",RU:"Russia",RW:"Rwanda",KN:"Saint Kitts and Nevis",LC:"Saint Lucia",VC:"Saint Vincent and the Grenadines",WS:"Samoa",SM:"San Marino",ST:"Sao Tome and Principe",SA:"Saudi Arabia",SN:"Senegal",RS:"Serbia",SC:"Seychelles",SL:"Sierra Leone",SG:"Singapore",SK:"Slovakia",SI:"Slovenia",SB:"Solomon Islands",SO:"Somalia",ZA:"South Africa",KR:"South Korea",SS:"South Sudan",ES:"Spain",LK:"Sri Lanka",SD:"Sudan",SR:"Suriname",SE:"Sweden",CH:"Switzerland",SY:"Syria",TW:"Taiwan",TJ:"Tajikistan",TZ:"Tanzania",TH:"Thailand",TL:"Timor-Leste",TG:"Togo",TO:"Tonga",TT:"Trinidad and Tobago",TN:"Tunisia",TR:"Turkey",TM:"Turkmenistan",TV:"Tuvalu",UG:"Uganda",UA:"Ukraine",AE:"United Arab Emirates",GB:"United Kingdom",US:"United States",UY:"Uruguay",UZ:"Uzbekistan",VU:"Vanuatu",VA:"Vatican City",VE:"Venezuela",VN:"Vietnam",VG:"British Virgin Islands",VI:"U.S. Virgin Islands",YE:"Yemen",ZM:"Zambia",ZW:"Zimbabwe"};
import { BG2, BG3, BDR, TXT, MUT, DIM, ORG, GRN, SANS, DISP, BADGES } from '../lib/constants';

export function Btn({children,onClick,variant="orange",small=false,full=false,style:sx={}}){
  const v={orange:{background:"transparent",color:ORG,border:`1px solid ${ORG}`},ghost:{background:"transparent",color:ORG,border:`1px solid rgba(163,230,53,0.4)`},subtle:{background:"transparent",color:MUT,border:`1px solid ${BDR}`},danger:{background:"transparent",color:"#f87171",border:"1px solid rgba(220,60,60,0.5)"},approve:{background:"transparent",color:GRN,border:`1px solid rgba(163,230,53,0.5)`},gold:{background:"transparent",color:ORG,border:`1px solid ${ORG}`}}[variant]||{};
  return <button onClick={onClick} style={{...v,fontFamily:SANS,fontWeight:700,fontSize:small?10:12,letterSpacing:.5,cursor:"pointer",borderRadius:0,padding:small?"5px 12px":"10px 22px",width:full?"100%":"auto",transition:"opacity .15s,transform .1s",...sx}} onMouseEnter={e=>{e.currentTarget.style.opacity=".85";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)";}}>{children}</button>;
}

export function Card({children,style:sx={}}){
  return <div style={{background:BG2,border:`1px solid ${BDR}`,borderRadius:0,padding:24,...sx}}>{children}</div>;
}

export function Field({label,type="text",value,onChange,placeholder,min,max,required,autoFocus,suffix}){
  return <div style={{marginBottom:14}}>
    <label style={{display:"block",fontFamily:SANS,fontSize:11,fontWeight:600,color:MUT,marginBottom:5,textTransform:"uppercase",letterSpacing:.8}}>{label}{required&&<span style={{color:ORG,marginLeft:2}}>*</span>}</label>
    <div style={{position:"relative"}}>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max} autoFocus={autoFocus}
        style={{width:"100%",background:BG3,border:`1px solid ${BDR}`,borderRadius:0,padding:suffix?"10px 48px 10px 14px":"10px 14px",color:TXT,fontFamily:SANS,fontSize:14,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}
        onFocus={e=>e.target.style.borderColor=ORG} onBlur={e=>e.target.style.borderColor=BDR}/>
      {suffix&&<div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)"}}>{suffix}</div>}
    </div>
  </div>;
}

export function PhotoField({label,value,onChange,required}){
  return <div style={{marginBottom:14}}>
    <label style={{display:"block",fontFamily:SANS,fontSize:11,fontWeight:600,color:MUT,marginBottom:5,textTransform:"uppercase",letterSpacing:.8}}>{label}{required&&<span style={{color:ORG,marginLeft:2}}>*</span>}</label>
    <div style={{border:`1px dashed rgba(255,0,144,0.3)`,borderRadius:0,padding:16,background:"rgba(255,0,144,0.03)",textAlign:"center"}}>
      {value?<><img src={value} alt="" style={{maxHeight:100,maxWidth:"100%",marginBottom:6,objectFit:"cover"}}/><div style={{fontFamily:SANS,fontSize:11,color:GRN}}>Photo uploaded</div></>:<div style={{color:DIM,fontFamily:SANS,fontSize:12}}>No photo selected</div>}
      <input type="file" accept="image/*" onChange={onChange} style={{display:"block",margin:"8px auto 0",fontFamily:SANS,fontSize:11,color:MUT}}/>
    </div>
  </div>;
}

export function Pill({label,color}){
  const map={approved:GRN,pending:"#f0b429",rejected:"#f87171",disabled:"#6b7280"};
  const c=map[color]||MUT;
  return <span style={{fontFamily:SANS,fontSize:10,fontWeight:600,letterSpacing:.8,color:c,background:`${c}18`,border:`1px solid ${c}44`,borderRadius:0,padding:"2px 8px",textTransform:"uppercase"}}>{label}</span>;
}

export function BadgePill({badge,small}){
  if(!badge||!BADGES[badge]) return null;
  const b=BADGES[badge];
  return <span style={{fontFamily:SANS,fontSize:small?9:10,fontWeight:600,color:b.color,background:b.bg,border:`1px solid ${b.border}`,borderRadius:0,padding:small?"1px 6px":"2px 9px",whiteSpace:"nowrap",letterSpacing:.5}}>{b.icon} {b.label}</span>;
}

export function Overlay({children,onClose}){
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:BG2,border:`1px solid rgba(255,255,255,0.1)`,borderRadius:0,width:"100%",maxWidth:520,padding:30,position:"relative",boxShadow:"0 32px 100px rgba(0,0,0,0.15)",maxHeight:"92vh",overflowY:"auto"}}>
      <button onClick={onClose} style={{position:"absolute",top:14,right:16,background:"none",border:"none",color:MUT,fontSize:20,cursor:"pointer",lineHeight:1}}>✕</button>
      {children}
    </div>
  </div>;
}

export function countryFlag(code){
  if(!code) return null;
  const name = COUNTRY_NAMES[code.toUpperCase()] || code;
  return <img src={`https://flagcdn.com/160x120/${code.toLowerCase()}.png`} alt={`${name} flag`} style={{width:20,height:15,objectFit:"cover",display:"inline-block",verticalAlign:"middle",marginLeft:6}} loading="lazy"/>;
}
