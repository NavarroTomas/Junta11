import React from "react";
export default function Image({unoptimized,priority,...props}:React.ImgHTMLAttributes<HTMLImageElement>&{unoptimized?:boolean;priority?:boolean}){void unoptimized;return <img {...props} loading={priority?"eager":props.loading??"lazy"}/>;}
