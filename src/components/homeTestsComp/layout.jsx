import "./layout.scss";
// Skeleton komponenti
function TestsSkeleton() {
  return (
    <div className='tests-container'>
      <div className="tests-container-inner">
        <h1>Testlar <div className="skeleton-link"><span>Barchasini ko'rish</span> <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M184 112l144 144-144 144" /></svg></div></h1>

        <div className="tests-content skeleton-tests">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="skeleton-test-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-text">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
              </div>
              <div className="skeleton-footer">
                <div className="skeleton-line"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestsSkeleton