import { motion } from "framer-motion";

const styles = `
  .loader-container {
    height: 100%;
    width: 100%;
    position: absolute;
    background-color: rgba(155, 150, 150, 0.3);
    z-index: 11;  
  }

  .spinner {
    display: flex;
  }
`;

function Loader() {
  return (
    <div className="loader-container">
      <style>{styles}</style>
      <motion.div
        className="spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default Loader;
