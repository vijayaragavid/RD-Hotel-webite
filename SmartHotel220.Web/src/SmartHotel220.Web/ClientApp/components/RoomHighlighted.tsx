import * as React from 'react';
import { Link } from 'react-router-dom';
import Room from './Room';

export class RoomHighlighted extends Room {

    private getButtonText(type: string): string {
        return type === 'hotel' ? 'Забронировать номер' : 'Забронировать конференц-зал';
    }

    private getLinkTo(id: number): string {
        return `/RoomDetail/${id}`;
    }

    public navigationButtons(): JSX.Element {
        return (
            <div className='sh-room-button'>
                <div className='sh-room-button'>
                    {this.getButtonText(this.props.itemType)}
                </div>
            </div>
        );
    }
}