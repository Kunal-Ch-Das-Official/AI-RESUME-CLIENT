const ButtonLoader = () => {
  return (
    <>
      <div
        className="spinner"
        role="status"
        aria-label="Loading"
        style={{
          fontSize: "28px",
          position: "relative",
          display: "inline-block",
          width: "1em",
          height: "1em",
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "0.4629em",
              bottom: 0,
              width: "0.074em",
              height: "0.2777em",
              borderRadius: "0.0555em",
              backgroundColor: "#fff",
              transformOrigin: "center -0.2222em",
              transform: `rotate(${i * 30}deg)`,
              animation: "spinner-fade 1s infinite linear",
              animationDelay: `${i * (1 / 12)}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes spinner-fade {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0.1;
          }
        }
      `}</style>
    </>
  );
};

export default ButtonLoader;