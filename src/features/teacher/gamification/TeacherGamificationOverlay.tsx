// @ts-nocheck
import TXToast         from './TXToast'
import RankUpModal     from './RankUpModal'
import BadgeEarnedModal from './BadgeEarnedModal'

export default function TeacherGamificationOverlay() {
  return (
    <>
      <TXToast />
      <BadgeEarnedModal />
      <RankUpModal />
    </>
  )
}
