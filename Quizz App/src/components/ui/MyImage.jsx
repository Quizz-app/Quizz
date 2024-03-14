import React from 'react';
import LazyLoad from 'react-lazyload';

const MyImage = ({ src, alt, width, height }) => {
  return (
    <LazyLoad height={height} once>
      <img className='rounded-xl' src={src} alt={alt} width={width} height={height} />
    </LazyLoad>
  );
};

export default MyImage;