import { useState } from 'react'
import { Button } from '../ui/index.ts'
import { AiLabel, BlockCard, Card, CheckTag, Dialog, HeroBand, Notices, Sheet, SourceBadge, StatusLineView, TipBlock } from '../surfaces/index.ts'
import styles from './Controls.module.css'
import { g } from './strings.ts'

/** Every surface, feedback component and label in the states its spec names. */
export function SurfacesShowcase() {
  const [sheet, setSheet] = useState(false)
  const [dialog, setDialog] = useState(false)
  const [notices, setNotices] = useState([
    { id: 'offline', message: g('bannerSample') },
    { id: 'stale', message: g('bannerActionSample') },
  ])

  return (
    <div className={styles.showcase}>
      <h4 className="type-label">{g('cards')}</h4>
      <Card>
        <HeroBand family="play">
          <span className="type-heading">{g('heroSample')}</span>
        </HeroBand>
        <p className="type-body">{g('cardSample')}</p>
      </Card>
      <BlockCard>{g('blockSample')}</BlockCard>
      <TipBlock>{g('tipSample')}</TipBlock>

      <h4 className="type-label">{g('labels')}</h4>
      <div className={styles.row}>
        <SourceBadge source="careTeam" />
        <SourceBadge source="parentProposed" reviewStatus="Proposed" />
        <AiLabel />
        <CheckTag />
      </div>

      <h4 className="type-label">{g('statusLines')}</h4>
      <StatusLineView text={g('statusSample')} />
      <StatusLineView text={g('statusUndoSample')} onUndo={() => {}} />

      <h4 className="type-label">{g('banners')}</h4>
      <Notices
        notices={notices.map((notice) => ({
          ...notice,
          onDismiss: () => setNotices((all) => all.filter((n) => n.id !== notice.id)),
          action: notice.id === 'stale' ? { label: g('bannerAction'), onAction: () => {} } : undefined,
        }))}
      />

      <h4 className="type-label">{g('sheets')}</h4>
      <div className={styles.row}>
        <Button variant="secondary" onClick={() => setSheet(true)}>
          {g('openSheet')}
        </Button>
        <Button variant="secondary" onClick={() => setDialog(true)}>
          {g('openDialog')}
        </Button>
      </div>
      <Sheet open={sheet} onOpenChange={setSheet} title={g('sheetTitle')} footer={<Button variant="quiet" onClick={() => setSheet(false)}>{g('sheetBack')}</Button>}>
        <TipBlock>{g('tipSample')}</TipBlock>
        <p className="type-body-sm">{g('sheetBody')}</p>
      </Sheet>
      <Dialog
        open={dialog}
        onOpenChange={setDialog}
        title={g('dialogTitle')}
        description={g('dialogBody')}
        actions={
          <>
            <Button variant="quiet" onClick={() => setDialog(false)}>
              {g('dialogNotNow')}
            </Button>
            <Button onClick={() => setDialog(false)}>{g('dialogShare')}</Button>
          </>
        }
      />
    </div>
  )
}
