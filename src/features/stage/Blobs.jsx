function Blobs({ blobs, blobRefs }) {
  return (
    <div className="blobs" aria-hidden="true">
      {blobs.map((blob, i) => (
        <span
          key={blob.id}
          ref={(el) => {
            blobRefs.current[i] = el;
          }}
          className={`blob ${blob.id}`}
          data-color={blob.color}
        />
      ))}
    </div>
  );
}

export default Blobs;
