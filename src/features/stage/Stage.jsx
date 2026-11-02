// 단계 ③에서 구현 예정인 임시 스텁
function Stage({ settings }) {
  return (
    <section className="stage" aria-label={settings.text}>
      <p>{settings.text}</p>
    </section>
  );
}

export default Stage;
