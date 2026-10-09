import { Component, type ReactNode } from 'react';
export class RecoveryBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError() {return {failed:true};}
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="app-loading" role="alert"><h1>Gemblast Saga</h1><p>Oyun ekranı açılamadı. Kayıtlarını silmeden yeniden açabilirsin.</p><button className="primary-button" onClick={()=>window.location.reload()}>Oyunu yeniden aç</button></main>;
  }
}
