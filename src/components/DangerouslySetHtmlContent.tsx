import React from 'react';
import { useEffect, useRef } from 'react';
interface Contentprops {
  html: string;
  rest?: { [key: string]: any };
}

function DangerouslySetHtmlContent(props: Contentprops) {
  const { html, ...rest } = props;
  const divRef: any = useRef(null);

  useEffect(() => {
    if (!html) return;

    const slotHtml = document.createRange().createContextualFragment(html); // Create a 'tiny' document and parse the html string
    divRef.current.innerHTML = ''; // Clear the container
    divRef.current.appendChild(slotHtml); // Append the new content
  }, [html]);

  return <div {...rest} ref={divRef}></div>;
}

export default DangerouslySetHtmlContent;
