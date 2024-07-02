import { AbstractTransformer, CurrentState } from "./abstract_transformer"

export class NoteTransformer extends AbstractTransformer {
    protected processHeadingLine(): string | null {
        if (!this.isEmpty(this.next) || this.next.includes('—')){
            this.next = ''
        }
        return super.processHeadingLine()
    }
    
    protected processRegular() : string | null {
        if (String(this.current).includes('<br>')) {
            return this.current.replace(/<br>/g, '') + '\n'
        }
        return this.current
    }

    protected processEmptyLine(): string | null {
        return this.current
    }
    
    protected processTagLine(): string | null {
        if (this.current == '---') {
            this.prevState = CurrentState.InsideProps
            this.state = CurrentState.None
            return this.current
        }
        if (this.isTag(this.current)) {
            if (this.hasFlashTag(this.current)) {
                this.outputContent = this.outputContent.slice(0,-1)
                return ''
            }
        } else {
            this.state = CurrentState.InsideProps
        }
        return this.current
    }

    protected processSnippet(): string | null {
        return null
    }
}
