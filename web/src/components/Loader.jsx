import { motion } from 'framer-motion';

function Loader() {
  return (
    <div className="loader-container">
      <motion.div
        className="spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export default Loader;